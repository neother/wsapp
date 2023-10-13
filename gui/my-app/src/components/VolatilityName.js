import React, { Component } from "react";
import PropTypes from "prop-types";
import { Toast, Table, Button, Modal } from "react-bootstrap";
import Record from "./Record";
import Chart from "./Chart";
import "./Record.css";

export default class VolatilityName extends Component {
  constructor() {
    super();
    this.state = {
      show: false,
    };
  }

  handleClose = () => {
    let isShow = false;
    this.setState({ show: isShow });
  };

  handleShow = () => {
    let isShow = true;
    this.setState({ show: isShow });
  };
  render() {
    return <>{this.props.name.split(/[._]/)[1]}</>;
  }
}
