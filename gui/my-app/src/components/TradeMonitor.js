import React, { Component, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Toast, Table, Button, Modal, Form, ListGroup } from "react-bootstrap";
import Record from "./Record";
import Chart from "./Chart";
import StoredRecords from "./StoredRecords";
import VolatilityName from "./VolatilityName";
import FuturesInfo from "./FuturesInfo";
import "./FuturesInfo.css";
import Account from "./Account";
import PositionsTable from "./PositionsTable";
import OrderTable from "./OrderTable";
import Automation from "./Automation";
import TradeOperation from "./TradeOperation";
import { baseURL } from "../properties/prop";
import "./TradeMonitor.css";
import Line from "./Line";
import FinishedOrders from "./FinishedOrders";
import { tqsdkg } from "../util/tqsdkg";
import TotalAutomation from "./TotalAutomation";

export default function TradeMonitor(props) {
  const [show, setShow] = useState(false);
  const [chartName, setChartName] = useState("");
  const [chartScale, setChartScale] = useState("1");
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [contracts, setContracts] = useState("");
  const tableBodyRef = useRef(null);
  const defaultChartName = "CZCE.TA410";
  const chartScales = ["1", "5", "60", "1440"];
  const [askPrice1, setAskPrice1] = useState();
  const [askVolume1, setAskVolume1] = useState();
  const [bidPrice1, setbidPrice1] = useState();
  const [bidVolume1, setbidVolume1] = useState();
  const [selectedColIndex, setSelectedColIndex] = useState(null);
  const [tradeDirections, setTradeDirections] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [directions, setDirections] = useState([]);

  useEffect(() => {
    tqsdkg.subscribeQuotesSet = new Set();
    const quote = tqsdkg.getQuote(chartName);
    // console.log("i am trade monitor:" + [...tqsdkg.subscribeQuotesSet]);
    const handleRtnData = () => {
      if (
        quote.bid_price1 !== undefined &&
        quote.bid_price1 !== "" &&
        quote.bid_price1 !== "-"
      ) {
        setAskPrice1(quote.ask_price1);
        setAskVolume1(quote.ask_volume1);
        setbidPrice1(quote.bid_price1);
        setbidVolume1(quote.bid_volume1);
      }
    };
    tqsdkg.on("rtn_data", handleRtnData);
    return () => {
      tqsdkg.off("rtn_data", handleRtnData);
    };
  }, [chartName]);

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  const getPositionsFromAPI = () => {
    const url = "http://" + baseURL + ":4001/positions";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.positions && data.positions.length > 0) {
          setChartName(data.positions[0].name);
        } else {
          setChartName(defaultChartName);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getPositionsFromAPI();
  }, []);

  const getContractFromAPI = () => {
    const url = "http://" + baseURL + ":4001/contracts";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setContracts(data.contracts);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getContractFromAPI();
  }, []);

  const toggleShow = (name, scale) => {
    // setShow(!show);
    // console.log("start to set chart name:" + name);
    setChartName(name);
    setChartScale(scale);
    props.setName(name);
    // console.log("end to set chart name:" + name);
  };

  const getClassName = (value) => {
    if (value >= 0.48) {
      return "redRow";
    } else if (value <= -0.48) {
      return "greenRow";
    } else if (value.toString().includes("SELL")) {
      return "greenRow";
    } else if (value.toString().includes("BUY")) {
      return "redRow";
    } else {
      return "wheatFont";
    }
  };

  const modifyArrayToString = (arr) => {
    if (arr == undefined || arr == "") {
      return;
    }
    const modifiedArray = arr.map((item) => {
      let newItem = "";
      switch (item[0]) {
        case "60":
          newItem = "H";
          break;
        case "1440":
          newItem = "D";
          break;
        default:
          newItem = item[0];
          break;
      }
      if (item[1] === "BUY") {
        newItem += "B/";
      } else if (item[1] === "SELL") {
        newItem += "S/";
      }
      return newItem;
    });

    const modifiedString = modifiedArray.join("");

    return modifiedString;
  };

  const getPositionRecordByName = (name) => {
    let record = null;
    props.positions &&
      props.positions.length > 0 &&
      props.positions.map((p) => {
        if (p.name.includes(chartName)) {
          record = p;
        }
      });

    return record;
  };

  const getPendingOrderRecordByName = (name) => {
    let record = null;
    props.orders &&
      props.orders.length > 0 &&
      props.orders.map((p) => {
        if (p.name.includes(chartName)) {
          record = p;
        }
      });

    return record;
  };

  const handleKey = (event) => {
    switch (event.key) {
      case "ArrowUp": {
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          // console.log("up pre index:" + prevIndex);
          return prevIndex <= 0 ? props.names.length - 1 : prevIndex - 1;
        });
        break;
      }
      case "ArrowDown": {
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          // console.log("down pre index:" + prevIndex);
          return prevIndex >= props.names.length - 1 ? 0 : prevIndex + 1;
        });
        break;
      }

      case "ArrowLeft": {
        event.preventDefault();
        console.log(chartScale);
        const currentIndex = chartScales.indexOf(chartScale);
        const nextIndex =
          currentIndex === 0 ? chartScales.length - 1 : currentIndex - 1;
        setChartScale(chartScales[nextIndex]);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        console.log(chartScale);
        const currentIndex = chartScales.indexOf(chartScale);
        const nextIndex =
          currentIndex === chartScales.length - 1 ? 0 : currentIndex + 1;
        setChartScale(chartScales[nextIndex]);
        break;
      }

      default:
        console.log(chartName + ":" + chartScale);
        break;
    }
  };

  useEffect(() => {
    if (props.names.length > 0) {
      setChartName(props.names[selectedRowIndex]);
    }
  }, [selectedRowIndex]);

  const getDirections = () => {
    const url = "http://" + baseURL + ":4001/get_trade_directions";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        // console.log(props.names);
        setDirections(data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    // const intervalId = setInterval(() => {
    getDirections();
    // }, 5000); // 5 seconds
    // return () => clearInterval(intervalId);
  }, [chartName]);

  const applyColor = (name, scale) => {
    let res = "wheat";
    // tradeDirections;
    props.directions &&
      props.directions.map((obj) => {
        if (obj.name.includes(name + "_" + scale)) {
          res = obj.direction === "SELL" ? "green" : "red";
        }
      });
    return res;
  };

  // const handleDirectionChange = (value, index) => {
  //   setDirections((prevDirections) => {
  //     const updatedDirections = [...prevDirections];
  //     updatedDirections[index] = value;
  //     return updatedDirections;
  //   });
  // };
  // function handleCellClick(event) {
  //   const newColIndex = event.target.cellIndex;
  //   if (selectedColIndex !== null) {
  //     // Remove highlight from the previously selected column
  //     const tableRows = event.target.parentNode.parentNode.rows;
  //     for (let i = 0; i < tableRows.length; i++) {
  //       tableRows[i].cells[selectedColIndex].classList.remove(
  //         "highlighted-col"
  //       );
  //     }
  //   }
  //   // Highlight the newly selected column
  //   setSelectedColIndex(newColIndex);
  //   const tableRows = event.target.parentNode.parentNode.rows;
  //   for (let i = 0; i < tableRows.length; i++) {
  //     tableRows[i].cells[newColIndex].classList.add("highlighted-col");
  //   }
  // }

  return (
    <div style={{ display: "flex", backgroundColor: "#242424" }}>
      <div style={{ flex: 1, maxWidth: "70%" }}>
        <Chart
          chartName={chartName}
          chartScale={chartScale}
          chartHeight="550"
          // setSelectKlines={setSelectKlines}
          positionRecord={
            getPositionRecordByName(chartName)
              ? getPositionRecordByName(chartName)
              : null
          }
          orderRecord={
            getPendingOrderRecordByName(chartName)
              ? getPendingOrderRecordByName(chartName)
              : null
          }
        ></Chart>

        <div
          style={{ display: "flex", flexDirection: "row", minHeight: "100px" }}
        >
          <PositionsTable
            positions={props.positions}
            setChartName={setChartName}
            setChartScale={setChartScale}
            chartScale={chartScale}
          ></PositionsTable>
          <OrderTable
            orders={props.orders}
            setChartName={setChartName}
            setChartScale={setChartScale}
            chartScale={chartScale}
          ></OrderTable>
        </div>

        <StoredRecords
          type="Result"
          records={props.storedRecords.length > 0 ? props.storedRecords : []}
        />
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: "15%",
          backgroundColor: "#242424",
        }}
      >
        <div className="info_name">
          {chartName && chartName.split(".")[1]}
          {chartName && directions.length > 0 && (
            <Automation name={chartName} directions={directions}></Automation>
          )}
          <TotalAutomation></TotalAutomation>
        </div>

        <Line></Line>
        <div className="scale">
          <Button
            size="sm"
            variant="outline-light"
            type="button"
            style={{
              marginRight: "5px",
              marginLeft: "5px",
              borderColor: "wheat",
            }}
            onClick={() => {
              setChartScale("1");
            }}
          >
            1
          </Button>
          <Button
            size="sm"
            variant="outline-light"
            type="button"
            style={{
              marginRight: "5px",
              marginLeft: "5px",
              borderColor: "wheat",
            }}
            onClick={() => {
              setChartScale("5");
            }}
          >
            5
          </Button>
          <Button
            size="sm"
            variant="outline-light"
            type="button"
            style={{
              marginRight: "5px",
              marginLeft: "5px",
              borderColor: "wheat",
            }}
            onClick={() => {
              setChartScale("60");
            }}
          >
            H
          </Button>
          <Button
            size="sm"
            variant="outline-light"
            type="button"
            style={{
              marginRight: "5px",
              marginLeft: "5px",
              borderColor: "wheat",
            }}
            onClick={() => {
              setChartScale("1440");
            }}
          >
            日
          </Button>
        </div>
        <Line></Line>
        <FuturesInfo
          name={chartName}
          askPrice1={askPrice1}
          askVolume1={askVolume1}
          bidPrice1={bidPrice1}
          bidVolume1={bidVolume1}
        ></FuturesInfo>
        <Line></Line>
        <TradeOperation
          name={chartName}
          account_details={props.account_details}
          positions={props.positions}
          bidPrice1={bidPrice1}
        ></TradeOperation>
        <Line></Line>
        <Account account_details={props.account_details}></Account>
        <Line></Line>
        <FinishedOrders
          finished_orders={props.finished_orders}
          setChartName={setChartName}
        ></FinishedOrders>
      </div>
      <div style={{ flex: 1, maxWidth: "16%" }}>
        <Table
          variant="dark"
          bordered
          responsive
          hover
          size="sm"
          style={{
            marginBottom: 0,
            minHeight: "600px",
            backgroundColor: "#242424",
            // backgroundColor: "silver",
          }}
        >
          <thead className="Rate" style={{ color: "wheat" }}>
            <tr>
              <th style={{ width: "1%", fontSize: "smaller" }}>Name</th>
              <th style={{ width: "1%", fontSize: "smaller" }}>5M</th>
              <th style={{ width: "1%", fontSize: "smaller" }}>Hour</th>
              <th style={{ width: "1%", fontSize: "smaller" }}>Day</th>
              <th style={{ width: "1%", fontSize: "smaller" }}>Act</th>
              <th style={{ width: "1%", fontSize: "smaller" }}>Auto</th>
            </tr>
          </thead>
          <tbody ref={tableBodyRef} onKeyDown={handleKey} tabIndex="1">
            {props.names.map((name, index) => (
              <tr
                key={name}
                className={selectedRowIndex === index ? "highlighted-row" : ""}
                onClick={() => {
                  handleRowClick(index);
                }}
              >
                <td
                  style={{
                    color: "wheat",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "smaller",
                    fontWeight: "bold",
                    width: "10px",
                    verticalAlign: "middle",
                  }}
                  onClick={(event) => {
                    toggleShow(name.split("_")[0], "1");
                  }}
                >
                  <VolatilityName name={name} />
                </td>
                <td
                  style={{
                    fontSize: "smaller",
                    color: applyColor(name, 5),
                    maxWidth: "20px",
                    verticalAlign: "middle",
                  }}
                  // className={getClassName(props.fiveMins[index])}
                  onClick={(event) => {
                    toggleShow(name.split("_")[0], "5");
                  }}
                >
                  {props.fiveMins[index]}
                </td>
                <td
                  style={{
                    fontSize: "smaller",
                    color: applyColor(name, 60),
                    maxWidth: "10px",
                    verticalAlign: "middle",
                  }}
                  onClick={(event) => {
                    toggleShow(name.split("_")[0], "60");
                  }}
                >
                  {props.hours[index]}
                </td>
                <td
                  style={{
                    fontSize: "smaller",
                    color: applyColor(name, 1440),
                    maxWidth: "10px",
                    verticalAlign: "middle",
                  }}
                  // className={getClassName(props.days[index])}
                  onClick={(event) => {
                    toggleShow(name.split("_")[0], "1440");
                  }}
                >
                  {props.days[index]}
                </td>

                <td
                  style={{
                    fontSize: "smaller",
                    color: "wheat",
                    verticalAlign: "middle",
                  }}
                  // className={getClassName(props.actions[index])}
                >
                  {modifyArrayToString(props.actions[index])}
                </td>
                <td>
                  {directions.length > 0 && (
                    <Automation
                      name={name}
                      directions={directions}
                    ></Automation>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
