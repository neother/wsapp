import React, { Component, useState } from "react";

import { Button, Table, Modal } from "react-bootstrap";
import "./Record.css";
import Chart from "./Chart";

export default function Record(props) {
  const applyColorBaseOnAction = () => {
    return props.record.action.toLowerCase().includes("buy")
      ? "redRow"
      : "greenRow";
  };

  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);
  const handleShow = () => setShow(true);
  // let name = props.record.name.split('.')[1]

  const convertScale = () => {
    let scale = "";
    if (props.record.scale / 1440 === 1) {
      scale = "Day";
    } else if (props.record.scale / 1440 > 1) {
      scale = "Week";
    } else {
      scale = props.record.scale;
    }
    return scale;
  };

  return (
    <>
      <tr className={applyColorBaseOnAction()} onClick={toggleShow}>
        {/* <tr> */}
        {/* // <tr> */}
        {/* <td>{props.record.id}</td> */}
        <td>{props.record.name.split(".")[1]}</td>
        <td>{convertScale()}</td>
        <td>{props.record.action}</td>
        <td>{props.record.offset}</td>
        <td>{props.record.time}</td>
        <td>{props.record.reason}</td>
        <td>{props.record.created_time}</td>
        <td>{props.record.profit}</td>
        <td>{props.record.stop}</td>
        <td>{props.record.current_price}</td>
      </tr>
      <tr>
        {show ? (
          <td colSpan="12">
            <Chart
              chartName={props.record.name}
              chartScale={props.record.scale}
              chartHeight="400"
              kLineWidth="300"
            ></Chart>
          </td>
        ) : (
          <></>
        )}
      </tr>
    </>
  );
}
