import React, { Component } from "react";
import { Toast, Nav, Navbar, Button, NavDropdown } from "react-bootstrap";
import Clock from "./Clock";
import "./Navigator.css";

export default class Navi extends Component {
  render() {
    return (
      <div className="head">
        <Navbar
          bg="dark"
          variant="dark"
          expand="lg"
          style={{ fontSize: "x-large" }}
        >
          <Nav>
            <Nav.Link href="#futures" style={{ color: "wheat" }}>
              Futures
            </Nav.Link>
            <Nav.Link>|</Nav.Link>
            <Nav.Link href="#stocks" style={{ color: "wheat" }}>
              Stocks
            </Nav.Link>
            <Nav.Link>|</Nav.Link>
            <Nav.Link href="#config" style={{ color: "wheat" }}>
              Config
            </Nav.Link>
            <Nav.Link>|</Nav.Link>
            <Nav.Link href="#dashboard" style={{ color: "wheat" }}>
              DashBoard
            </Nav.Link>
            <Nav.Link>|</Nav.Link>
            <Nav.Link href="#trendboard" style={{ color: "wheat" }}>
              TrendBoard
            </Nav.Link>
          </Nav>
        </Navbar>
        <Clock></Clock>
      </div>
    );
  }
}
