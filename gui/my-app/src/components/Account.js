import React, { Component, useState } from "react";
// import PropTypes from "prop-types";
import { Toast, Table, Button, Modal } from "react-bootstrap";
// import Record from "./Record";
// import Chart from "./Chart";
// import VolatilityName from "./VolatilityName";
// import FuturesInfo from "./FuturesInfo";
import "./Account.css";

export default function Account(props) {
  const static_balance = props?.account_details?.static_balance
    ?.toString()
    ?.split(".")[0];
  const balance = props?.account_details?.balance?.toString()?.split(".")[0];
  const float_profit = props?.account_details?.float_profit
    ?.toString()
    ?.split(".")[0];

  const close_profit = props?.account_details?.close_profit
    ?.toString()
    ?.split(".")[0];

  const available = props?.account_details?.available
    ?.toString()
    ?.split(".")[0];

  const commission = props?.account_details?.commission
    ?.toString()
    ?.split(".")[0];

  let risk_ratio = props?.account_details?.risk_ratio * 100;
  risk_ratio = parseFloat(risk_ratio).toFixed(1);

  return (
    <div>
      <Table
        variant="dark"
        striped
        // responsive
        // bordered
        // hover
        size="sm"
        style={{
          margin: 0,
          color: "wheat",
          lineHeight: "1",
          backgroundColor: "#242424",
        }}
      >
        <thead>
          <tr>
            <td>Static</td>
            <td>{static_balance}</td>
          </tr>
          <tr>
            <td>Balance</td>
            <td>{balance}</td>
          </tr>
          <tr>
            <td>Float Profit</td>
            <td className={float_profit >= 0 ? "profit" : "loss"}>
              {float_profit}
            </td>
          </tr>
          <tr>
            <td>Close Profit</td>
            <td className={close_profit >= 0 ? "profit" : "loss"}>
              {close_profit}
            </td>
          </tr>
          <tr>
            <td>commission</td>
            <td>{commission}</td>
          </tr>
          <tr>
            <td>available</td>
            <td>{available}</td>
          </tr>
          <tr>
            <td>risk_ratio</td>
            <td>{risk_ratio}%</td>
          </tr>
        </thead>
      </Table>
    </div>
  );
}
