import React, { Component } from "react";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts/lib/echarts";
import timestampToTime from "../util/timestampToTime";
import { cloneDeep, random } from "lodash";
import { Axis } from "echarts/lib/export";
import { Button } from "react-bootstrap";
import { baseURL } from "../properties/prop";

export default class StockChart extends Component {
  constructor() {
    super();
    this.state = this.getInitialState();
    this.chartHeight = "600%";
    // this.props.record.code = "600004";
  }
  timeTicket = null;

  getInitialState = () => ({ option: this.getOption() });

  getChartHeight = () => {
    return this.props.chartHeight == null
      ? this.chartHeight
      : this.props.chartHeight;
  };

  getKlineWidth = () => {
    return this.props.kLineWidth == null
      ? this.kLineWidth
      : this.props.kLineWidth;
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
      result.push(sum / dayCount);
    }
    return result;
  };

  componentDidUpdate(prevProps) {
    if (this.props.record !== prevProps.record) {
      this.componentDidMount();
    }
  }

  componentDidMount() {
    // let code = '600620'
    if (this.props.record) {
      const url =
        "http://" +
        baseURL +
        ":8000/stocks/bars?stock_code=" +
        this.props.record.code +
        "&offset=400";
      fetch(url, {
        method: "get",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json,text/plain,*/*",
        },
      })
        .then((response) => {
          console.log(
            "get kline for: " + this.props.record.code + " " + new Date()
          );
          // console.log(response.json());
          return response.json();
        })
        .then((lines) => {
          // console.log(lines);
          const option = cloneDeep(this.state.option);
          let date = lines.data.map((item) => {
            return [item.datetime];
          });

          let latest_rise =
            lines.data[lines.data.length - 1].rise &&
            lines.data[lines.data.length - 1].rise;
          if (latest_rise >= 0) {
            latest_rise = "+" + latest_rise;
          }

          // console.log(date)
          option.xAxis.data = date;
          let data = lines.data.map((item) => {
            return [
              parseFloat(item.open.toFixed(2)),
              parseFloat(item.close.toFixed(2)),
              parseFloat(item.low.toFixed(2)),
              parseFloat(item.high.toFixed(2)),
              parseFloat(item.rise.toFixed(2)),
              item.datetime.split(" ")[0],
              lines.name,
            ];
          });
          option.series[0].data = data;
          option.series[1].data = this.calculateMA(5, data);
          option.series[2].data = this.calculateMA(10, data);
          // option.series[3].data = this.calculateMA(40, data);
          option.series[4].data = this.calculateMA(60, data);
          // option.series[0].name = this.props.chartScale + " mins";
          option.title.text =
            this.props.record.name +
            " " +
            this.props.record.code +
            "  " +
            latest_rise +
            "%" +
            "  (" +
            this.props.record.act_reason +
            " )";

          let url =
            "http://" +
            baseURL +
            ":8000/stocks/filter_result?code=" +
            this.props.record.code;
          let dataList = [];
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
              data.map((i) => {
                if (i.action.toLowerCase() == "sell") {
                  let sellCoord = {
                    coord: [i.time, i.act_price],
                    symbol: "pin",
                    symbolRotate: 90,
                    symbolSize: [12, 17],
                    // symbolOffset: [0, 12],
                  };
                  sellCoord.itemStyle = { color: "white" };
                  dataList.push(sellCoord);
                } else {
                  let buyCoord = {
                    coord: [i.time, i.act_price],
                    symbol: "arrow",
                    symbolRotate: 270,
                    symbolSize: [5, 12],
                    // symbolOffset: [0, -12],
                  };
                  buyCoord.itemStyle = { color: "white" };
                  dataList.push(buyCoord);
                }
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
            })
            .then(() => {
              option.series[0].markPoint.data = dataList;
              this.setState({ option: option });
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  componentWillUnmount() {
    console.log("i am ummounting");
    console.log(this.state.klines);
  }

  getOption = () => {
    return {
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
        right: 55,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          animation: false,
          type: "cross",
          lineStyle: {
            color: "#376df4",
            width: 2,
            opacity: 1,
          },
        },
        formatter(params) {
          // console.log(params);
          var data = params[0].data;
          var m5 = params[1].data;
          var m10 = params[2].data;
          var m60 = params[3].data;
          return [
            "Name:" + data[7],
            "Date: " + data[6],
            "Open: " + data[1],
            "Close: " + data[2],
            "Low: " + data[3],
            "High: " + data[4],
            "Rise: " + data[5] + "%",
            "M5: " + m5,
            "M10: " + m10,
            "M60: " + m60,
          ].join("<br/>");
        },
      },
      dataZoom: [
        {
          textStyle: {
            color: "#8392A5",
          },
          // handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          // start: 30,
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
          itemStyle: {
            color: "#21202D",
            color0: "#0CF49B",
            // color0: '#00F0F0',
            borderColor: "#FD1050",
            borderColor0: "#0CF49B",
            // borderColor0: '#00F0F0'
          },
          markPoint: {
            //     // },
            label: "arrow test",
            data: "",
          },
        },
        {
          name: "MA5",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 0.8,
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
            width: 0.8,
            color: "yellow",
          },
        },
        {
          name: "MA40",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 0.8,
            color: "purple",
          },
        },
        {
          name: "MA60",
          type: "line",
          data: "",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 0.8,
            color: "green",
          },
        },
      ],
    };
  };
  render() {
    return (
      <div>
        <div style={{ "text-align": "center" }}></div>
        <ReactEcharts
          echarts={echarts}
          option={this.state.option}
          notMerge={false}
          lazyUpdate={true}
          theme={"theme_name"}
          style={{
            height: this.getChartHeight(),
            width: "100%",
          }}
        />
      </div>
    );
  }
}
