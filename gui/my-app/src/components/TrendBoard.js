import React, { Component } from "react";
import { useState, useEffect } from "react";
import { baseURL } from "../properties/prop";
import echarts from "echarts/lib/echarts";
import Line from "./Line";
import LineChart from "./LineChart";
import { Button } from "react-bootstrap";
import { backgroundColor } from "echarts/lib/theme/dark";
import BackTestNames from "./BackTestNames";

export default function TrendBoard() {
  const [records, setRecords] = useState([]);
  const [names, setNames] = useState([]);
  const [totallineChartData, setTotalLineChartData] = useState([]);

  const getNames = () => {
    const url = "http://" + baseURL + ":4001/test_names";
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
        setNames(data.names);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getNames();
  }, []);

  const getDetailedBacktestResult = (scale) => {
    const url =
      "http://" + baseURL + ":4001/detailed_back_testing_result?scale=" + scale;

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
        setTotalLineChartData(data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    getDetailedBacktestResult(1);
  }, []);

  return (
    <div style={{ backgroundColor: "silver" }}>
      <Button
        style={{ backgroundColor: "grey" }}
        onClick={(event) => {
          getDetailedBacktestResult(1);
        }}
      >
        get 1
      </Button>
      <Button
        style={{ backgroundColor: "grey" }}
        onClick={(event) => {
          getDetailedBacktestResult(5);
        }}
      >
        get 5
      </Button>
      <Button
        style={{ backgroundColor: "grey" }}
        onClick={(event) => {
          getDetailedBacktestResult(60);
        }}
      >
        get 60
      </Button>

      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, maxWidth: "5%" }}>
          <BackTestNames></BackTestNames>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            marginLeft: "20px",
          }}
        >
          {totallineChartData &&
            totallineChartData.map((i) => (
              <LineChart
                key={i.name} // Adding a unique key for each chart iteration
                data={{
                  xLabels: i.times,
                  yValues: i.data,
                  lenValues: i.length,
                  title: i.name + " " + i.scale,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
