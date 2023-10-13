import React, { Component } from "react";
import { Button, Table, Toast } from "react-bootstrap";

import FuturesResult from "./FuturesResult";

export default class FuturesMonitors extends Component {
  constructor() {
    super();
    console.log("i am adding the monitors");
  }
  render() {
    return (
      <div>
        <Table
          variant="dark"
          responsive
          size="sm"
          style={{ fontSize: "small" }}
        >
          <tbody>
            <tr>
              <td>
                {/* <Chart chartName = 'SHFE.ag2012' chartScale = '1'></Chart> */}
                <FuturesResult></FuturesResult>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}
