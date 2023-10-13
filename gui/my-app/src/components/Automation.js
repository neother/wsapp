import React, { Component, useState, useEffect } from "react";
import { Toast, Table, Button, Modal, Spinner } from "react-bootstrap";
import "./Automation.css";
import { baseURL } from "../properties/prop";

export default function Automation(props) {
  const [direction, setDirection] = useState("");

  const findDirection = (name, data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].name === name) {
        setDirection(data[i].direction);
        return;
      }
    }
  };

  useEffect(
    () => {
      // const intervalId = setInterval(() => {
      if (props.name && props.directions) {
        findDirection(props.name, props.directions);
      }
    },
    //  5000); // 5 seconds
    // return () => clearInterval(intervalId);
    // }
    [props.name]
  );

  const createNewDirection = (newDirection) => {
    if (newDirection === direction) {
      return "STOP";
    } else {
      return newDirection;
    }
  };

  const saveDirection = (event, directionParam) => {
    event.preventDefault();
    let newDirection = createNewDirection(directionParam);

    const url =
      "http://" +
      baseURL +
      ":4001/save_trade_direction?name=" +
      props.name +
      "&direction=" +
      newDirection;
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
        setDirection(newDirection);
      });
  };

  const getButtonColor = () => {
    return direction === "AUTO" ? "btn btn-info" : "outline-info";
  };

  return (
    <div>
      <Button
        size="xs"
        variant={getButtonColor()}
        type="submit"
        onClick={(event) => {
          saveDirection(event, "AUTO");
        }}
        style={{ fontSize: "10px", padding: "0.2rem 0.2rem" }}
      >
        {direction === "AUTO" ? (
          <div style={{ margin: 0 }}>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              style={{
                marginRight: "0.2rem",
                width: "0.8rem",
                height: "0.8rem",
              }} // Adjust width and height for the spinner
            ></span>
          </div>
        ) : (
          <span>AUTO</span>
        )}
      </Button>
    </div>
  );
}
