import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

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
import "./OrderTable.css";
import { baseURL } from "../properties/prop";

export default function OrderTable(props) {
  const [isCancelOrderLoading, setisCancelOrderLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [chartName, setChartName] = useState("");
  const [chartScale, setChartScale] = useState("5");

  const [contracts, setContracts] = useState("");
  const tableBodyRef = useRef(null);

  const chartScales = ["1", "5", "60", "1440"];
  const [askPrice1, setAskPrice1] = useState();
  const [askVolume1, setAskVolume1] = useState();
  const [bidPrice1, setbidPrice1] = useState();
  const [bidVolume1, setbidVolume1] = useState();
  const [selectedColIndex, setSelectedColIndex] = useState(null);

  const cancelOrder = (event, order) => {
    event.preventDefault();
    // event.stopPropagation();
    setisCancelOrderLoading(true);
    let name = order.name;
    let price = order.open_price;
    let action = order.action;
    const url =
      "http://" +
      baseURL +
      ":4001/cancel_orders?name=" +
      name +
      "&price=" +
      price +
      "&action=" +
      action;
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    })
      .then((response) => {
        console.log("cancel order");
      })
      .then(() => {
        setisCancelOrderLoading(false);
      });
  };

  const handleKey = (event) => {
    switch (event.key) {
      case "ArrowUp": {
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          console.log("up pre index:" + prevIndex);
          return prevIndex <= 0 ? props.orders.length - 1 : prevIndex - 1;
        });
        break;
      }
      case "ArrowDown": {
        event.preventDefault();
        setSelectedRowIndex((prevIndex) => {
          console.log("down pre index:" + prevIndex);
          return prevIndex >= props.orders.length - 1 ? 0 : prevIndex + 1;
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
    if (props.orders.length > 0) {
      props.setChartName(props.orders[selectedRowIndex].name);
    }
  }, [selectedRowIndex]);

  const handleRowClick = (index) => {
    setSelectedRowIndex(index);
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
        <tr>
          <th>Name</th>
          <th>Action</th>
          <th>Offset</th>
          <th>Open Price</th>
          <th>Volume Left</th>
          <th>Order Time</th>
          {/* <th>Margin</th> */}
          <th>Operation</th>
        </tr>
      </thead>
      <tbody ref={tableBodyRef} onKeyDown={handleKey} tabIndex="3">
        {props.orders &&
          props.orders.length > 0 &&
          props.orders.map((order, index) => (
            <tr
              key={order.order_id}
              className={selectedRowIndex === index ? "highlighted-row" : ""}
              onClick={() => {
                props.setChartName(order.name);
                handleRowClick(index);
              }}
            >
              <td style={{ verticalAlign: "middle" }}>{order.name}</td>
              <td
                className={order.action == "BUY" ? "profit" : "loss"}
                style={{ verticalAlign: "middle" }}
              >
                {order.action}
              </td>
              <td style={{ verticalAlign: "middle" }}>
                {order.offset.split("TODAY")[0]}
              </td>
              <td style={{ verticalAlign: "middle" }}>{order.open_price}</td>

              <td style={{ verticalAlign: "middle" }}>
                {order.volume_left}/{order.volume_orign}
              </td>
              <td style={{ verticalAlign: "middle" }}>
                {order.insert_date_time}
              </td>
              {/* <td style={{ verticalAlign: "middle" }}>{order.margin}</td> */}
              <td className="small-button" style={{ verticalAlign: "middle" }}>
                <Button
                  size="xs"
                  variant="outline-light"
                  type="submit"
                  onClick={(event) => {
                    cancelOrder(event, order);
                  }}
                >
                  {isCancelOrderLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Cancel"
                  )}
                </Button>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
}
