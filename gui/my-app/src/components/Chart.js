import React, { Component } from "react";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts/lib/echarts";
import timestampToTime from "../util/timestampToTime";
import { cloneDeep, random } from "lodash";

import { tqsdkg } from "../util/tqsdkg";
import { line } from "echarts/lib/theme/dark";
import { clear } from "echarts/lib/util/throttle";
import { baseURL } from "../properties/prop";

export default class Chart extends Component {
  constructor() {
    super();
    this.state = {
      option: this.getOption(),
      latestKlines: [],
      dbRecord: [],
      isDBRecordReturned: false,
      // openPrice: 0,
    };

    this.kLineWidth = "500";
    this.tempName = "";
    this.tempScale = "";
  }

  getChartName = () => {
    return this.props.chartName;
    // === "" ? "SHFE.rb2310" : this.props.chartName;
  };

  getChartHeight = () => {
    return this.props.chartHeight == null
      ? this.chartHeight
      : this.props.chartHeight;
  };

  // getKlineWidth = () => {
  //   return this.props.kLineWidth == null
  //     ? this.kLineWidth
  //     : this.props.kLineWidth;
  // };

  getKlineWidth = () => {
    return this.props.chartScale == 1 ? "1500" : "1000";
  };

  getPositionOpenPrice = () => {
    if (!this.props || !this.props.positionRecord) {
      return 0;
    }
    return this.props.positionRecord.open_price
      ? this.props.positionRecord.open_price
      : 0;
  };

  getPositionStopPrice = () => {
    if (!this.props || !this.props.positionRecord) {
      return 0;
    }
    return this.props.positionRecord.stop ? this.props.positionRecord.stop : 0;
  };

  getPositionProfitPrice = () => {
    if (!this.props || !this.props.positionRecord) {
      return 0;
    }
    return this.props.positionRecord.profit
      ? this.props.positionRecord.profit
      : 0;
  };

  getPositionAction = () => {
    if (!this.props || !this.props.positionRecord) {
      return "";
    }
    return this.props.positionRecord.action
      ? this.props.positionRecord.action
      : "";
  };

  getPositionVolume = () => {
    if (!this.props || !this.props.positionRecord) {
      return "";
    }
    return this.props.positionRecord.volume
      ? this.props.positionRecord.volume
      : "";
  };

  getOrderOpenPrice = () => {
    if (!this.props || !this.props.orderRecord) {
      return 0;
    }
    return this.props.orderRecord.open_price
      ? this.props.orderRecord.open_price
      : 0;
  };

  getOrderAction = () => {
    if (!this.props || !this.props.orderRecord) {
      return "";
    }
    return this.props.orderRecord.action ? this.props.orderRecord.action : "";
  };

  getOrderVolume = () => {
    if (!this.props || !this.props.orderRecord) {
      return "";
    }
    return this.props.orderRecord.volume ? this.props.orderRecord.volume : "";
  };

  calculateMA = (dayCount, data) => {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += data[i - j][1];
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  };

  componentDidMount() {
    this.getDBRecord();
    this.getLatestKlines();
    this.setupChart();
    this.interval = setInterval(this.setupChart, 200);
    this.interval_get_db_record = setInterval(this.getDBRecord, 3000);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.chartName !== prevProps.chartName ||
      prevProps.chartScale !== this.props.chartScale
    ) {
      clearInterval(this.interval);
      clearInterval(this.interval_get_db_record);
      this.componentDidMount();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval_get_db_record);
    clearInterval(this.interval);
    console.log("aaa....i am unmouted");
    tqsdkg.off("rtn_data", this.latestKlinesListener);
  }

  getDBRecord = () => {
    let url =
      "http://" +
      baseURL +
      ":4001/db?name=" +
      this.getChartName() +
      "&scale=" +
      this.props.chartScale;
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // let filtered = data.filter((e) => e.reason.includes("2-"));
        // this.setState({ dbRecord: filtered });
        this.setState({ dbRecord: data });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  latestKlinesListener = () => {
    if (this.props.chartName !== "") {
      const lines = tqsdkg
        .getKlines(this.getChartName(), 60 * 1e9 * this.props.chartScale)
        .data.filter((el) => {
          return el != null;
        });
      this.setState({ latestKlines: lines });
    }
  };

  getLatestKlines = () => {
    if (this.props.chartName !== "") {
      tqsdkg.setChart({
        symbol: this.getChartName(),
        duration: 60 * 1e9 * this.props.chartScale,
        view_width: 1000, //this.getKlineWidth(),
      });
    }
    tqsdkg.off("rtn_data", this.latestKlinesListener);
    tqsdkg.on("rtn_data", this.latestKlinesListener);
  };

  caculatePrecison = (name) => {
    if (name.includes("i2") || name.includes("IF") || name.includes("IH")) {
      return 1;
    }
    return 0;
  };

  getSymbolRotate = (action, offset) => {
    if (action.toLowerCase() == "sell" && offset.toLowerCase() == "open")
      return 90;

    if (action.toLowerCase() == "buy" && offset.toLowerCase() == "close")
      return 270;

    if (action.toLowerCase() == "buy" && offset.toLowerCase() == "open")
      return 270;

    if (action.toLowerCase() == "sell" && offset.toLowerCase() == "close")
      return 90;
  };

  setupChart = () => {
    try {
      const option = cloneDeep(this.state.option);
      let result = this.state.latestKlines.reduce(
        (acc, item) => {
          acc.date.push(timestampToTime(item.datetime));
          acc.data.push([
            parseFloat(item.open.toFixed(2)),
            parseFloat(item.close.toFixed(2)),
            parseFloat(item.low.toFixed(2)),
            parseFloat(item.high.toFixed(2)),
          ]);
          return acc;
        },
        { date: [], data: [] }
      );

      option.xAxis.data = result.date;
      option.series[0].data = result.data;

      option.series[1].data = this.calculateMA(5, result.data);
      option.series[2].data = this.calculateMA(10, result.data);
      option.series[3].data = this.calculateMA(20, result.data);
      // option.series[4].data = this.calculateMA(120, result.data);
      option.series[5].data = this.calculateMA(60, result.data);
      option.series[0].name = this.props.chartScale + " mins";
      option.title.text = this.getChartName() + " " + this.props.chartScale;
      let dataList = this.state.dbRecord.map((i) => {
        let { time, current_price, action, reason, offset } = i;
        let coord = [time, current_price];
        let symbol =
          (action.toLowerCase() == "sell" && offset.toLowerCase() == "open") ||
          (action.toLowerCase() == "buy" && offset.toLowerCase() == "close")
            ? "pin"
            : "arrow";
        let symbolRotate = this.getSymbolRotate(action, offset);

        let symbolSize =
          (action.toLowerCase() == "sell" && offset.toLowerCase() == "open") ||
          (action.toLowerCase() == "buy" && offset.toLowerCase() == "close")
            ? [12, 17]
            : [7, 12];
        return {
          coord,
          symbol,
          symbolRotate,
          symbolSize,
          action,
          reason,
          itemStyle: { color: "white" },
        };
      });
      dataList.push({
        name: "",
        type: "max",
        valueDim: "highest",
        symbol: "rect",
        symbolSize: [0, 1],
        symbolOffset: [0, 0],
        // symbolRotate: 90,
        itemStyle: { color: "white" },
        label: {
          show: true,
          formatter: "{c}",
          position: "top",
          offset: [0, 0],
          textStyle: {
            fontSize: 12,
            // fontWeight: "bold",
            color: "#FD1050",
          },
        },
      });
      dataList.push({
        name: "",
        type: "min",
        symbol: "rect",
        symbolSize: [0, 1],
        symbolOffset: [0, 0],
        // symbolRotate: 90,
        valueDim: "lowest",
        itemStyle: { color: "white" },
        label: {
          show: true,
          formatter: "{c}",
          position: "bottom",
          offset: [0, 0],
          textStyle: {
            fontSize: 12,
            // fontWeight: "bold",
            color: "#0CF49B",
          },
        },
      });
      option.series[0].markPoint.data = dataList;
      // option.series[0].markPoint.symbol = "none";

      option.series[0].markLine.data[0].yAxis = this.getPositionOpenPrice();
      option.series[0].markLine.data[0].label.formatter =
        "{c}" + " " + this.getPositionAction();

      // this.getPositionVolume();

      option.series[0].markLine.data[1].yAxis = this.getOrderOpenPrice();
      option.series[0].markLine.data[1].label.formatter =
        "{c}" + " " + this.getOrderAction();

      option.series[0].markLine.data[2].yAxis = this.getPositionStopPrice();
      option.series[0].markLine.data[2].label.formatter = "{c}";

      option.series[0].markLine.data[3].yAxis = this.getPositionProfitPrice();
      option.series[0].markLine.data[3].label.formatter = "{c}";
      option.tooltip.axisPointer.label.precision = this.caculatePrecison(
        this.props.chartName
      );
      this.setState({ option: option });
    } catch (err) {
      console.log(err);
    }
  };

  getOption = () => {
    return {
      // backgroundColor: "#21202D",
      backgroundColor: "#242424",
      title: {
        text: "",
        left: "45%",
        textStyle: {
          color: "wheat",
        },
      },
      xAxis: {
        type: "category",
        data: "",

        axisLine: { lineStyle: { color: "#8392A5" } },
      },
      yAxis: [
        {
          type: "value",
          offset: 15,
          scale: true,
          axisLine: { lineStyle: { color: "#8392A5", opacity: 0.03 } },
          splitLine: {
            show: true,
            lineStyle: {
              opacity: 0.03,
            },
          },
          position: "right",
        },
      ],
      grid: {
        bottom: 60,
        left: 20,
        right: 75,
      },

      tooltip: {
        trigger: "axis",
        axisPointer: {
          animation: false,
          type: "cross",
          lineStyle: {
            // color: "#376df4",
            color: "grey",
            width: 1,
            opacity: 1,
          },
          label: { precision: "" },
        },
      },
      dataZoom: [
        {
          textStyle: { color: "#8392A5" },
          // handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',

          handleSize: "100%",
          dataBackground: {
            areaStyle: {
              color: "#8392A5",
            },
            lineStyle: {
              opacity: 0.8,
              color: "#8392A5",
            },
          },
          handleStyle: {
            color: "#fff",
            shadowBlur: 3,
            shadowColor: "rgba(0, 0, 0, 0.6)",
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
        },
        {
          type: "inside",
        },
      ],
      animation: false,
      series: [
        {
          type: "candlestick",
          name: "",
          data: "",
          barWidth: "70%",
          itemStyle: {
            color: "#21202D",
            color0: "#0CF49B",
            borderColor: "#FD1050",
            borderColor0: "#0CF49B",
            borderWidth: 1,
          },

          markPoint: {
            label: "arrow test",
            data: "",
            tooltip: {
              trigger: "item",
              formatter: (params) => {
                return (
                  params.data.action +
                  " " +
                  params.data.reason +
                  " " +
                  params.data.coord[1]
                );
              },
              extraCssText: "width: 130px,font-size: small",
            },
          },
          markLine: {
            symbol: "none",
            data: [
              {
                yAxis: 0, //this.getPositionOpenPrice(), //3669,  // the price at which you want to display the line
                lineStyle: {
                  color: "silver",
                  width: 0.5,
                  type: "solid",
                },
                label: {
                  show: true,
                  formatter: "{c}", // display the price value
                  position: "end", // position the label on the right side of the line
                  color: "silver",
                },
                tooltip: {
                  show: false,
                },
              },
              {
                yAxis: 0, //this.getPositionOpenPrice(), //3669,  // the price at which you want to display the line
                lineStyle: {
                  color: "silver",
                  width: 0.5,
                  type: "dash",
                },
                label: {
                  show: true,
                  formatter: "{c}", // display the price value
                  position: "end", // position the label on the right side of the line
                  color: "silver",
                },
                tooltip: {
                  show: false,
                },
              },
              {
                yAxis: 0, //this.getPositionStopPrice(), //3669,  // the price at which you want to display the line
                lineStyle: {
                  color: "silver",
                  width: 0.5,
                  type: "dash",
                },
                label: {
                  show: true,
                  formatter: "{c}", // display the price value
                  position: "end", // position the label on the right side of the line
                  color: "silver",
                },
                tooltip: {
                  show: false,
                },
              },
              {
                yAxis: 0, //this.getPositionProfitPrice(), //3669,  // the price at which you want to display the line
                lineStyle: {
                  color: "silver",
                  width: 0.5,
                  type: "dash",
                },
                label: {
                  show: true,
                  formatter: "{c}", // display the price value
                  position: "end", // position the label on the right side of the line
                  color: "silver",
                },
                tooltip: {
                  show: false,
                },
              },
            ],
          },
        },
        {
          name: "MA5",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 0.7,
            color: "white",
          },
        },
        {
          name: "MA10",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 0.7,
            color: "yellow",
          },
        },
        {
          name: "MA20",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 0.7,
            color: "purple",
          },
        },
        {
          name: "MA40",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 0.7,
            color: "silver",
          },
        },
        {
          name: "MA60",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: "green",
          },
        },
      ],
    };
  };

  render() {
    return (
      <div>
        <ReactEcharts
          echarts={echarts}
          option={this.state.option}
          notMerge={false}
          lazyUpdate={true}
          theme={"theme_name"}
          style={{
            height: this.getChartHeight() + "%",
            width: "100%",
          }}
        />
      </div>
    );
  }
}
