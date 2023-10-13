import React, { Component, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Toast,
  Table,
  Button,
  Modal,
  Form,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import "./TradeOperation.css";
import { baseURL } from "../properties/prop";
import { tqsdkg } from "../util/tqsdkg";
import { backgroundColor } from "echarts/lib/theme/dark";

import Line from "./Line";
import { color } from "echarts/lib/theme/light";

export default function BackTestNames(props) {
  const [names, setNames] = useState("");
  const [loading, setLoading] = useState(false);

  const getTestnames = () => {
    // event.preventDefault();

    const url = "http://" + baseURL + ":4001/test_names";
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
        // console.log(data);
        setNames(data.names);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getTestnames();
  }, []);

  const handleClick = (event, name) => {
    event.preventDefault();
    setLoading(true);
    const url =
      "http://" + baseURL + ":4001/back_testing?name=" + name.split(".")[1];
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
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <ListGroup variant="flush">
        {names &&
          names.map((name) => (
            <ListGroup.Item
              key={name}
              style={{
                padding: "0px 2px 0px 2px",
                fontSize: " smaller",
                backgroundColor: "silver",
                color: "black",
              }}
              onClick={(event) => {
                handleClick(event, name);
              }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : name}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </div>
  );
}
