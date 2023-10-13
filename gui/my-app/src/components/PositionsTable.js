import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { baseURL } from "../properties/prop";
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Spinner,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import "./PositionsTable.css";

export default function PositionsTable(props) {
  const [isClearPositionLoading, setisClearPositionLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [chartName, setChartName] = useState("");
  const [chartScale, setChartScale] = useState("5");

  const [contracts, setContracts] = useState("");
  const tableBodyRef = useRef(null);
  const defaultChartName = "SHFE.rb2310";
  const chartScales = ["1", "5", "60", "1440"];
  const [askPrice1, setAskPrice1] = useState();
  const [askVolume1, setAskVolume1] = useState();
  const [bidPrice1, setbidPrice1] = useState();
  const [bidVolume1, setbidVolume1] = useState();
  const [selectedColIndex, setSelectedColIndex] = useState(null);
  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
  };

  const handleKey = (event) => {
    switch (event.key) {
      case "ArrowUp": {
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          console.log("up pre index:" + prevIndex);
          return prevIndex <= 0 ? props.positions.length - 1 : prevIndex - 1;
        });
        break;
      }
      case "ArrowDown": {
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          console.log("down pre index:" + prevIndex);
          return prevIndex >= props.positions.length - 1 ? 0 : prevIndex + 1;
        });
        break;
      }

      case "ArrowLeft": {
        event.preventDefault();

        const currentIndex = chartScales.indexOf(props.chartScale);
        const nextIndex =
          currentIndex === 0 ? chartScales.length - 1 : currentIndex - 1;
        props.setChartScale(chartScales[nextIndex]);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();

        const currentIndex = chartScales.indexOf(props.chartScale);
        const nextIndex =
          currentIndex === chartScales.length - 1 ? 0 : currentIndex + 1;
        props.setChartScale(chartScales[nextIndex]);
        break;
      }

      default:
        break;
    }
  };

  useEffect(() => {
    if (props.positions.length > 0) {
      props.setChartName(props.positions[selectedRowIndex].name);
    }
  }, [selectedRowIndex]);

  const closePosition = (event, position, enforced) => {
    event.preventDefault();
    // event.stopPropagation();
    setisClearPositionLoading(true);
    let name = position.name;
    // let action = position.action;
    let isEnforced = enforced.toString();
    const url =
      "http://" +
      baseURL +
      ":4001/close_positions?name=" +
      name +
      "&enforced=" +
      isEnforced;
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    })
      .then((response) => {
        console.log("clear position");
      })
      .then(() => {
        setisClearPositionLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Table
      variant="dark"
      responsive
      bordered
      hover
      size="sm"
      style={{
        marginBottom: 0,
        color: "wheat",
        lineHeight: "1",
        backgroundColor: "#242424",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#242424" }}>
          <th>Name</th>
          <th>Action</th>

          <th>Volume</th>
          <th>Float Profit</th>
          <th>Open Price</th>
          <th>Profit</th>
          <th>Stop</th>
          <th>Margin</th>
          <th>Operation</th>
        </tr>
      </thead>
      <tbody ref={tableBodyRef} onKeyDown={handleKey} tabIndex="2">
        {props.positions &&
          props.positions.length > 0 &&
          props.positions.map((position, index) => (
            <tr
              key={index}
              className={selectedRowIndex === index ? "highlighted-row" : ""}
              onClick={(event) => {
                handleRowClick(index);
                props.setChartName(position.name);
              }}
            >
              <td
                style={{ verticalAlign: "middle" }}
                // onClick={() => props.setChartName(position.name)}
              >
                {position.name}
              </td>
              <td
                className={position.action == "Buy" ? "profit" : "loss"}
                style={{ verticalAlign: "middle" }}
              >
                {position.action}
              </td>

              <td style={{ verticalAlign: "middle" }}>{position.volume}</td>
              <td
                className={position.float_profit >= 0 ? "profit" : "loss"}
                style={{ verticalAlign: "middle" }}
              >
                {position.float_profit}
              </td>
              <td style={{ verticalAlign: "middle" }}>{position.open_price}</td>
              <td style={{ verticalAlign: "middle" }}>{position.profit}</td>
              <td style={{ verticalAlign: "middle" }}>{position.stop}</td>
              <td style={{ verticalAlign: "middle" }}>{position.margin}</td>
              <td
                className="p-small-button"
                style={{ verticalAlign: "middle" }}
              >
                <Button
                  size="xs"
                  variant="outline-light"
                  type="submit"
                  onClick={(event) => {
                    closePosition(event, position, 0);
                  }}
                >
                  {isClearPositionLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Close"
                  )}
                </Button>

                <Button
                  size="xs"
                  variant="outline-light"
                  type="submit"
                  onClick={(event) => {
                    closePosition(event, position, 1);
                  }}
                >
                  {isClearPositionLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "C+1"
                  )}
                </Button>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
}
