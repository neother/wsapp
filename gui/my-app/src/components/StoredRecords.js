import React, { Component } from "react";
import PropTypes from "prop-types";
import { Toast, Table } from "react-bootstrap";
import Record from "./Record";
// import './Clock.css'
export default class StoredRecords extends Component {
  render() {
    return (
      <div>
        <Table
          variant="dark"
          responsive
          bordered
          hover
          size="sm"
          style={{ marginBottom: 0, backgroundColor: "#242424" }}
        >
          <thead>
            <tr
              style={{
                color: "wheat",
                maxHeight: "5px",
                backgroundColor: "#242424",
              }}
            >
              {/* <td>#{this.props.type}</td> */}
              <td>Name</td>
              <td>Scale</td>
              <td>Action</td>
              <td>OFFSET</td>
              <td>Bar Time</td>
              <td>Reason</td>
              <td>Created Time</td>
              <td>Profit</td>
              <td>Stop</td>
              <td>ACT Price</td>
              {/* <td>View</td> */}
            </tr>
          </thead>
          <tbody>
            {this.props.records.length > 0 &&
              this.props.records.map((record) => (
                <Record key={record.id} record={record} />
              ))}
          </tbody>
        </Table>
      </div>
    );
  }
}
