import React, { Component, useState } from "react";
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
import Chart from "./Chart";
import names from "../properties/names";
import getPrimaryName from "../util/getPrimaryName";
import StoredRecords from "./StoredRecords";
import StockRecord from "./StockRecord";
import { baseURL } from "../properties/prop";

import "./StocksTable.css";
import { number } from "echarts/lib/export";
import StockChart from "./StockChart";

const primary_names = names;
export default class StocksTable extends Component {
  constructor() {
    super();
    this.state = {
      records: [],
      isLoading: false,
      isRefreshLoading: false,
      isEnhancedLoading: false,
      isFavoriteLoading: false,
      isAllExpand: true,
      isSingleExpand: false,
      totalAmplitude: 0,
      totalCount: 0,
      winsCount: 0,
      loseCount: 0,
      hostname: "192.168.0.102",
      code: "",
      buyActive: false,
      sellActive: false,
      enhanceActive: false,
      favoriteActive: false,
      // tmp: ,
      tableRecord: "", //{ code: "999999", name: "aaaaa" },
      selectedRow: null,
      recordFavoriteStatus: false,
      isRecordSelected: false,
      ShowPositiveRecords: false,
    };
    this.handleCodeChange = this.handleCodeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.tableBodyRef = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.isKeyDownProcessed = false;
    this.tmpRecords = [];
  }

  handleCodeChange(event) {
    this.setState({ code: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state.code);
    const url =
      "http://" +
      baseURL +
      ":8000/stocks/filter_result?code=" +
      this.state.code;
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log(err);
      })
      .then((data) => {
        this.setState({
          records: data,
          totalCount: data.length,
        });
      });
  }

  toggleExpand = () => {
    if (this.state.isAllExpand == false) {
      this.setState({ isSingleExpand: false });
    }

    if (this.state.isAllExpand == true) {
      this.setState({ isSingleExpand: true });
    }

    this.setState({
      isAllExpand: !this.state.isAllExpand,
    });
    console.log(this.state.isAllExpand + "isAllExpand in table");
    console.log(this.state.isSingleExpand + "isSingleExpand in table");
  };

  getBuyResults = () => {
    this.setState({ isRefreshLoading: true });
    const url = "http://" + baseURL + ":8000/stocks/filter_result?action=buy";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log(err);
      })
      .then((data) => {
        this.tmpRecords = data;
        this.setState({
          records: data,
          totalCount: data.length,
          favoriteActive: false,
          buyActive: true,
          sellActive: false,
          enhanceActive: false,
        });
      })
      .then(() => {
        this.getRefresh();
      });
  };

  getSellResults = () => {
    this.setState({ isRefreshLoading: true });
    const url = "http://" + baseURL + ":8000/stocks/filter_result?action=sell";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log(err);
      })
      .then((data) => {
        this.tmpRecords = data;
        this.setState({
          records: data,
          totalCount: data.length,
          sellActive: true,
          favoriteActive: false,
          buyActive: false,
          enhanceActive: false,
        });
      })
      .then(() => {
        this.getRefresh();
      });
  };

  getRefresh = () => {
    this.handleRefresh();
  };

  handleRefresh = () => {
    this.setState({ isRefreshLoading: true });
    let data = this.state.records;
    const promises = data.map((i) => {
      let kline_url =
        "http://" +
        baseURL +
        ":8000/stocks/bars?stock_code=" +
        i.code +
        "&offset=2";
      return fetch(kline_url, {
        method: "get",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json,text/plain,*/*",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          if (result.data.length > 0) {
            i.raised_today = result.data[1]?.rise;
            i.current_price = result.data[1]?.close;
            i.amplitude = (
              ((parseFloat(result.data[1].close) - parseFloat(i.act_price)) /
                parseFloat(i.act_price)) *
              100
            ).toFixed(2);

            return i;
          } else {
            i.raised_today = 999;
            i.current_price = 999;
            i.amplitude = 999;
            return i;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
    Promise.all(promises)
      .then((data) => {
        // let filteredData = data.filter(
        //   (record) => parseFloat(record.amplitude) > 0
        // );
        // let totalAmplitude = filteredData.reduce((total, record) => {
        //   return total + parseFloat(record.amplitude && record.amplitude);
        // }, 0);
        // totalAmplitude = parseFloat(totalAmplitude).toFixed(2);
        let winsCount = 0;
        let loseCount = 0;
        let totalCount = 0;
        data.forEach((i) => {
          totalCount++;
          if (i.amplitude >= 0) {
            winsCount++;
          } else {
            loseCount++;
          }
        });
        this.setState({
          // records: onlyCheckPositive ? filteredData : data,
          records: data,
          // totalAmplitude,
          winsCount,
          loseCount,
          totalCount,
          isRefreshLoading: false,
          tableRecord: data[0],
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // this.setState({ isRefreshLoading: false });
  };

  togglePositiveRecords = () => {
    if (!this.state.ShowPositiveRecords) {
      this.tmpRecords = this.state.records;
      let positive = this.state.records.filter(
        (record) => parseFloat(record.amplitude) > 0
      );
      this.setState({
        records: positive,
        ShowPositiveRecords: !this.state.ShowPositiveRecords,
      });
    } else if (this.state.ShowPositiveRecords) {
      this.setState({
        records: this.tmpRecords,
        ShowPositiveRecords: false,
      });
    }
  };

  handleFilter = () => {
    this.setState({ isLoading: true });
    const url = "http://" + baseURL + ":8000/stocks/filter";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("get the records: " + data);
        this.setState({ isLoading: false });
        this.getBuyResults();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getEnhancedResults = () => {
    this.setState({ isRefreshLoading: true });
    const url = "http://" + baseURL + ":8000/stocks/enhanced_result";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log(err);
      })
      .then((data) => {
        this.tmpRecords = data;
        this.setState({
          records: data,
          totalCount: data.length,
          // isEnhancedLoading: false,
          favoriteActive: false,
          buyActive: false,
          sellActive: false,
          enhanceActive: true,
          // tableRecord: data[0],
        });
      })
      .then(() => {
        this.getRefresh();
      });
  };

  getFavoritedStocks = () => {
    this.setState({ isRefreshLoading: true });
    const url = "http://" + baseURL + ":8000/stocks/favorited_stocks";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        return response.json();
      })

      .then((data) => {
        this.tmpRecords = data;
        this.setState({
          records: data,
          totalCount: data & data.length,
          favoriteActive: true,
          buyActive: false,
          sellActive: false,
          enhanceActive: false,
          // tableRecord: data[0],
        });
      })
      .then(() => {
        this.getRefresh();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  deleteRecord = (record) => {
    const recordIndex = this.state.records.indexOf(record);
    const newRecords = this.state.records.filter(
      (item, index) => index !== recordIndex
    );
    this.setState({
      records: newRecords,
    });
  };

  handleDeleteAll = () => {
    const url = "http://" + baseURL + ":8000/stocks/delete_all";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(() => this.getBuyResults());
  };

  handleDeleteToday = () => {
    const url = "http://" + baseURL + ":8000/stocks/delete_today";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(() => this.getFavoritedStocks());
  };

  handleRowClick(index, record) {
    this.setState({ selectedRow: index, tableRecord: record }, () => {
      console.log(this.state.selectedRow);
    });
  }

  componentDidMount() {
    this.getFavoritedStocks();
    this.tableBodyRef.current.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.tableBodyRef.current.removeEventListener(
      "keydown",
      this.handleKeyDown
    );
  }

  handleKeyDown(event) {
    const { records } = this.state;
    const { keyCode } = event;
    let { selectedRow } = this.state;
    if (this.isKeyDownProcessed) {
      return;
    }
    console.log("pressed: " + keyCode);

    if (keyCode === 38) {
      // up arrow key
      if (selectedRow === null) {
        selectedRow = records.length - 1;
      } else {
        selectedRow = Math.max(selectedRow - 1, 0);
      }
    } else if (keyCode === 40) {
      // down arrow key
      if (selectedRow === null) {
        selectedRow = 0;
      } else {
        selectedRow = Math.min(selectedRow + 1, records.length - 1);
      }
    }

    if (selectedRow !== this.state.selectedRow) {
      this.setState({ selectedRow, tableRecord: records[selectedRow] });
    }
    this.isKeyDownProcessed = true;
    setTimeout(() => {
      this.isKeyDownProcessed = false;
    }, 100);
  }

  render() {
    return (
      <div className="stock_table">
        <div style={{ marginLeft: "2px" }}>
          <span>Total Count: {this.state.totalCount} </span>
          <span> Wins Count: </span>
          <span style={{ color: "red", fontWeight: "bold" }}>
            {this.state.winsCount}
          </span>
          <span> Lose Count: </span>
          <span style={{ color: "green", fontWeight: "bold" }}>
            {this.state.loseCount}
          </span>
          <br></br>
          <span>Total Amplitude: </span>
          <span style={{ color: "red", fontWeight: "bold" }}>
            {this.state.totalAmplitude}%
          </span>
          <br></br>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Form onSubmit={this.handleSubmit}>
              <InputGroup className="input-group-sm">
                <InputGroup.Prepend>
                  <InputGroup.Text id="code-label">#</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  type="text"
                  placeholder="Enter code"
                  aria-label="Code"
                  aria-describedby="code-label"
                  value={this.state.code}
                  onChange={this.handleCodeChange}
                />
                <InputGroup.Append>
                  <Button
                    size="sm"
                    variant="outline-info"
                    type="submit"
                    style={{ borderColor: "wheat", color: "wheat" }}
                  >
                    Search
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
            <Button
              size="sm"
              variant="outline-info"
              type="button"
              style={{
                marginRight: "5px",
                marginLeft: "5px",
                borderColor: "wheat",
                color: "wheat",
              }}
              active={this.state.buyActive}
              onClick={this.getBuyResults}
            >
              {this.state.isRefreshLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Buy"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline-info"
              type="button"
              style={{
                marginRight: "5px",
                borderColor: "wheat",
                color: "wheat",
              }}
              active={this.state.sellActive}
              onClick={this.getSellResults}
            >
              {this.state.isRefreshLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Sell"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline-info"
              type="button"
              style={{
                marginRight: "5px",
                borderColor: "wheat",
                color: "wheat",
              }}
              onClick={this.getEnhancedResults}
              active={this.state.enhanceActive}
            >
              {this.state.isRefreshLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Enhanced"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline-info"
              type="button"
              style={{
                marginRight: "5px",
                borderColor: "wheat",
                color: "wheat",
              }}
              onClick={this.getFavoritedStocks}
              active={this.state.favoriteActive}
            >
              {this.state.isRefreshLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Favorite"
              )}
            </Button>

            <Button
              size="sm"
              variant="outline-info"
              type="button"
              style={{
                float: "right",
                marginRight: "5px",
                borderColor: "wheat",
                color: "wheat",
              }}
              onClick={this.handleFilter}
            >
              {this.state.isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Start"
              )}
            </Button>
          </div>
          <div>
            <span style={{ marginRight: "50px" }}>
              Searched count better to greater than 10! Find the one won't
              reverse!
              <Button
                size="sm"
                variant="outline-info"
                type="button"
                style={{
                  marginLeft: "10px",
                  // fontSize: "10px",
                  color: "wheat",
                  borderColor: "wheat",
                  padding: "2px 5px 2px 5px",
                }}
                onClick={this.togglePositiveRecords}
                // active={this.state.favoriteActive}
              >
                Positive
              </Button>
              <Button
                size="sm"
                variant="outline-info"
                type="button"
                style={{
                  float: "right",
                  marginRight: "20px",
                  borderColor: "wheat",
                  color: "wheat",
                  padding: "2px 5px 2px 5px",
                }}
                onClick={this.handleRefresh}
              >
                {this.state.isRefreshLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Refresh"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline-info"
                type="button"
                style={{
                  float: "right",
                  marginRight: "20px",
                  borderColor: "wheat",
                  color: "wheat",
                  padding: "2px 5px 2px 5px",
                }}
                onClick={this.handleDeleteToday}
              >
                DeleteToday
              </Button>
            </span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "2px" }}>
          <div style={{ flex: 1 }}>
            <StockChart
              record={this.state.tableRecord}
              // handler={handleDelete}
            ></StockChart>
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: "30%",
              marginRight: "2px",
              maxHeight: "600px",
              overflowY: "scroll",
            }}
          >
            <Table
              responsive
              bordered
              hover
              size="sm"
              style={{
                fontSize: "12px",
                color: "wheat",
                backgroundColor: "#242424",
              }}
              variant="dark"
            >
              <thead style={{ position: "sticky", top: 0 }}>
                <tr align="center"></tr>
                <tr>
                  {/* <td>#</td> */}
                  <td>Code</td>
                  <td>Name</td>
                  <td>Act</td>
                  <td>Time</td>
                  {/* <td>Price</td> */}
                  <td>Rson</td>
                  <td>Created Time</td>
                  {/* <td>Curr</td> */}
                  <td>Today</td>
                  <td>Total</td>
                  <td>Opt</td>
                </tr>
              </thead>
              <tbody
                ref={this.tableBodyRef}
                onKeyDown={this.handleKeyDown}
                tabIndex="1"
              >
                {this.state.records.map((record, index) => (
                  <tr
                    key={record?.id}
                    className={
                      index === this.state.selectedRow ? "selected" : ""
                    }
                    onClick={() => this.handleRowClick(index, record)}
                  >
                    <StockRecord
                      record={record}
                      handleDeleteRecord={this.deleteRecord.bind(this)}
                      recordIndex={index}
                      selectedRow={this.state.selectedRow}
                    />
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
        <div style={{ minHeight: "200px" }}></div>
      </div>
    );
  }
}
