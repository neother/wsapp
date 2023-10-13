import React, { Component, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Toast, Table, Button, Modal, Form, ListGroup } from "react-bootstrap";
import "./TradeOperation.css";
import { baseURL } from "../properties/prop";
import { tqsdkg } from "../util/tqsdkg";
import { backgroundColor } from "echarts/lib/theme/dark";

import Line from "./Line";
import { color } from "echarts/lib/theme/light";

export default function FinishedOrders(props) {
  // const [finishedOrders, setFinishedOrders] = useState(props.finished_orders);

  // console.log(props.finished_orders);

  // const handleKey = (event) => {
  //   switch (event.key) {
  //     case "ArrowUp": {
  //       event.preventDefault();
  //       setSelectedRowIndex((prevIndex) => {
  //         console.log("up pre index:" + prevIndex);
  //         return prevIndex <= 0 ? props.positions.length - 1 : prevIndex - 1;
  //       });
  //       break;
  //     }
  //     case "ArrowDown": {
  //       event.preventDefault();
  //       setSelectedRowIndex((prevIndex) => {
  //         console.log("down pre index:" + prevIndex);
  //         return prevIndex >= props.positions.length - 1 ? 0 : prevIndex + 1;
  //       });
  //       break;
  //     }

  //     case "ArrowLeft": {
  //       event.preventDefault();

  //       const currentIndex = chartScales.indexOf(props.chartScale);
  //       const nextIndex =
  //         currentIndex === 0 ? chartScales.length - 1 : currentIndex - 1;
  //       props.setChartScale(chartScales[nextIndex]);
  //       break;
  //     }
  //     case "ArrowRight": {
  //       event.preventDefault();

  //       const currentIndex = chartScales.indexOf(props.chartScale);
  //       const nextIndex =
  //         currentIndex === chartScales.length - 1 ? 0 : currentIndex + 1;
  //       props.setChartScale(chartScales[nextIndex]);
  //       break;
  //     }

  //     default:
  //       break;
  //   }
  // };
  const handleClick = (event, name) => {
    event.preventDefault();
    props.setChartName(name);
  };
  return (
    <div>
      <ListGroup variant="flush">
        {props.finished_orders &&
          props.finished_orders.map((order) => (
            <ListGroup.Item
              key={order.order_id}
              style={{
                padding: "0px 2px 0px 2px",
                fontSize: " smaller",
                backgroundColor: "#242424",
                color: "wheat",
              }}
              onClick={(event) => {
                handleClick(event, order.name);
              }}
            >
              {order.insert_date_time.split(" ")[1]} {order.name.split(".")[1]},
              {order.action},{order.offset.split("TODAY")[0]},{order.open_price}
              /{order.trade_price},{order.volume_orign - order.volume_left}/
              {order.volume_orign},{order.last_msg}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </div>
  );
}
