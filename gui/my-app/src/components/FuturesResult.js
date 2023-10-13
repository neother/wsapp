import React, { Component } from "react";
import StoredRecords from "./StoredRecords";
import TradeMonitor from "./TradeMonitor";
import Charts from "./Charts";
import { sample } from "lodash";
import WebSocketClass from "../util/WebSocketClass";
import io from "socket.io-client";
import { baseURL } from "../properties/prop";
const socket = io.connect("http://" + baseURL + ":4001");

export default class FuturesResult extends Component {
  constructor() {
    super();
    this.state = {
      monitorRecords: [],
      volatilityName: [],
      volatilityFiveMins: [],
      volatilityHour: [],
      volatilityDay: [],
      account_details: {},
      dbRecords: [], //<5- 15
      name: "",
      positions: [],
      orders: [],
      finished_orders: [],
      directions: [],
    };
  }

  setName = (name) => {
    this.setState({ name });
  };

  getFilteredRecords = () => {
    const url = "http://" + baseURL + ":4001/db";
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
        this.setState({ dbRecords: data });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getEmitedResult = () => {
    socket.on("msg", (data) => {
      let volatilityArray = data.volatilities;
      let names = volatilityArray.volatilities_1_mins.map((x) => {
        return x["name"].split("_")[0];
      });
      let fiveMins = volatilityArray.volatilities_five_mins.map((x) => {
        return x["volatility"];
      });
      let hours = volatilityArray.volatilities_hour.map((x) => {
        return x["volatility"];
      });
      let days = volatilityArray.volatilities_day.map((x) => {
        return x["volatility"];
      });

      let monitorRecords = data.data;
      monitorRecords.map((i) => {
        i.name = i.name.split("_")[0];
      });
      this.setState({
        volatilityName: names,
        volatilityFiveMins: fiveMins,
        volatilityHour: hours,
        volatilityDay: days,
        monitorRecords: monitorRecords,
        account_details: data.account,
        positions: data.positions,
        orders: data.orders,
        finished_orders: data.finished_orders,
        directions: data.directions,
      });
    });
  };

  getPositionQuitPrice = () => {
    const url = "http://" + baseURL + ":4001/get_position_with_quit_price";
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        // this.setState({
        //   positions: data,
        // });
      });
  };

  componentDidMount() {
    this.getEmitedResult();
    this.getFilteredRecords();

    this.interval = setInterval(() => {
      this.getFilteredRecords();
    }, 10000);
  }

  componentWillUnmount() {
    console.log("um mounting...");
    clearInterval(this.interval);
  }

  covertToActionFromMonitroRecords = () => {
    let actions = [];
    let name_actions = {};

    this.state.monitorRecords.forEach((i) => {
      // name with 5min in the end
      if (!(i["name"] in name_actions)) {
        name_actions[i["name"]] = [[i["scale"], i["action"]]];
      } else {
        name_actions[i["name"]].push([i["scale"], i["action"]]);
      }
    });

    this.state.volatilityName.map((name) => {
      if (name in name_actions) {
        actions.push(
          name_actions[name].filter((item, index) => {
            return (
              index ===
              name_actions[name].findIndex((elem) => {
                return elem[0] === item[0] && elem[1] === item[1];
              })
            );
          })
        );
      } else {
        actions.push("");
      }
    });

    return actions;
  };

  render() {
    // if (this.props.scale != '30') {
    return (
      <div>
        <TradeMonitor
          names={this.state.volatilityName}
          fiveMins={this.state.volatilityFiveMins}
          hours={this.state.volatilityHour}
          days={this.state.volatilityDay}
          actions={this.covertToActionFromMonitroRecords()}
          account_details={this.state.account_details}
          setName={this.setName}
          positions={this.state.positions}
          orders={this.state.orders}
          finished_orders={this.state.finished_orders}
          directions={this.state.directions}
          storedRecords={this.state.dbRecords}
        />

        {/* <StoredRecords type="Result" records={this.state.dbRecords} /> */}
      </div>
    );
    // }
  }

  // else {
  //   return (
  //     <div>
  //       <Monitor type='monitor' records={this.state.monitorRecords}></Monitor>
  //     </div>
  //   )
  // };
}
