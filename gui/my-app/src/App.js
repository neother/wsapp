import React, { Component, useEffect } from "react";
import "./App.css";
import Navi from "./components/Navigator";

import { HashRouter, Route, Switch } from "react-router-dom";
import FuturesMonitors from "./components/FuturesMonitors";
import ConfigAdmin from "./components/ConfigAdmin";
import DashBoard from "./components/DashBoard";
import StocksTable from "./components/StocksTable";
import io from "socket.io-client";
import TrendBoard from "./components/TrendBoard";

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Navi></Navi>

        <HashRouter>
          <Switch>
            <Route exact path="/" component={FuturesMonitors} />
            <Route exact path="/futures" component={FuturesMonitors} />

            <Route exact path="/stocks" component={StocksTable} />
            <Route exact path="/config" component={ConfigAdmin} />
            <Route exact path="/dashboard" component={DashBoard} />
            <Route exact path="/trendboard" component={TrendBoard} />
          </Switch>
        </HashRouter>
      </div>
    );
  }
}
