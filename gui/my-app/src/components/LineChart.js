import React, { Component } from "react";
import { useState, useEffect, useRef } from "react";
import { baseURL } from "../properties/prop";

import echarts from "echarts/lib/echarts";

const LineChart = ({ data, title }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    const options = {
      title: {
        text: data.title,
        left: "45%",
      },

      xAxis: {
        type: "category",
        data: data.xLabels,
      },
      yAxis: {
        type: "value",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          animation: false,
          type: "cross",
          lineStyle: {
            // color: "#376df4",
            color: "grey",
            width: 1,
            opacity: 1,
          },
          // label: { precision: "" },
        },
      },
      series: [
        {
          data: data.yValues,
          type: "line",
        },
        {
          data: data.lenValues,
          type: "line",
        },
      ],
    };

    chart.setOption(options);

    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "16%", height: "250px" }} />;
};

export default LineChart;
