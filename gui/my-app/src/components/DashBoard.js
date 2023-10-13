import React, { Component } from "react";
import { useState, useEffect } from "react";
import { baseURL } from "../properties/prop";
import echarts from "echarts/lib/echarts";
import Line from "./Line";
import LineChart from "./LineChart";
import { Button } from "react-bootstrap";
import { backgroundColor } from "echarts/lib/theme/dark";
import BackTestNames from "./BackTestNames";

export default function DashBoard() {
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

  const getBacktestResult = (scale) => {
    const url =
      "http://" +
      baseURL +
      ":4001/aggregated_back_testing_result?scale=" +
      scale;

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
    getBacktestResult(1);
  }, []);

  const handleStartTest = (scale) => {
    const url = "http://" + baseURL + ":4001/back_testing?scale=" + scale;
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
        getBacktestResult(scale);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div style={{ backgroundColor: "silver" }}>
      <Button
        onClick={(event) => {
          handleStartTest(1);
        }}
      >
        save 1
      </Button>
      <Button
        onClick={(event) => {
          handleStartTest(5);
        }}
      >
        save 5
      </Button>
      <Button
        onClick={(event) => {
          handleStartTest(60);
        }}
      >
        save 60
      </Button>
      <Button
        style={{ backgroundColor: "grey" }}
        onClick={(event) => {
          getBacktestResult(1);
        }}
      >
        get 1
      </Button>
      <Button
        style={{ backgroundColor: "grey" }}
        onClick={(event) => {
          getBacktestResult(5);
        }}
      >
        get 5
      </Button>
      <Button
        style={{ backgroundColor: "grey" }}
        onClick={(event) => {
          getBacktestResult(60);
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
                  xLabels: i.created_times,
                  yValues: i.profits,
                  lenValues: i.lengths,
                  title: i.name + " " + i.scale,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
