import React, { Component } from "react";
import PropTypes from "prop-types";
import { Toast, Table, Container, Row, Col } from "react-bootstrap";
import Record from "./Record";
import Chart from "./Chart";
// import './Clock.css'
import sliceArray from "../util/sliceArray";
export default class Charts extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <Container fluid>
          {sliceArray(this.props.records, 1).map((subArray) => (
            <Row>
              {subArray.map((record) => (
                <Col xs={12}>
                  <Chart
                    chartName={record.name}
                    chartScale={record.scale}
                    chartHeight="600"
                    kLineWidth="500"
                  ></Chart>
                </Col>
              ))}
            </Row>
          ))}
        </Container>
      </div>
    );
  }
}
