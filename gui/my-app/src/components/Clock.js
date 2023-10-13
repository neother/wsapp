import React, { Component } from "react";
import PropTypes from "prop-types";
import { Toast } from "react-bootstrap";
import "./Clock.css";
import Automation from "./Automation";
export default class Clock extends Component {
  constructor() {
    super();
    this.state = {
      time: "",
    };
  }
  getTime() {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let date = new Date().getDate();
    let hours = new Date().getHours();
    let minuites = new Date().getMinutes();
    let second = new Date().getSeconds();
    let clockTime = `${year}-${month < 10 ? `0${month}` : `${month}`}-${
      date < 10 ? `0${date}` : `${date}`
    } ${hours < 10 ? `0${hours}` : `${hours}`}:${
      minuites < 10 ? `0${minuites}` : `${minuites}`
    }:${second < 10 ? `0${second}` : `${second}`} `;
    this.setState({ time: clockTime });
  }

  componentWillMount() {
    this.getTime();
  }

  componentDidMount() {
    this.interval = setInterval(() => this.getTime(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: "medium", marginRight: "10px", color: "wheat" }}
        ></span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "medium", marginRight: "10px", color: "wheat" }}
          >
            {this.state.time}
          </span>
        </div>
      </div>
    );
  }
}
