import React, { Component, useState, useEffect } from "react";
import { Toast, Table, Button, Modal, Spinner } from "react-bootstrap";
import "./Automation.css";
import { baseURL } from "../properties/prop";

export default function TotalAutomation(props) {
  const [auto, setAuto] = useState("");

  const getAuto = () => {
    const url = "http://" + baseURL + ":4001/auto_status";

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
        setAuto(data.status);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getAuto();
  }, []);

  const switchAuto = (event) => {
    event.preventDefault();
    const url = "http://" + baseURL + ":4001/switch_auto";

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
        setAuto(data.status);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getButtonColor = () => {
    return auto ? "btn btn-success" : "outline-success";
  };

  return (
    <div>
      <Button
        size="sm"
        variant={getButtonColor()}
        type="submit"
        onClick={(event) => {
          switchAuto(event);
        }}
        style={{ fontSize: "12px", marginRight: "20px" }}
      >
        {auto ? (
          <div style={{ margin: 0 }}>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              // style={{ marginRight: "0.2rem", width: "1rem", height: "1rem" }} // Adjust width and height for the spinner
            ></span>
            <span>AUTOING...</span>
          </div>
        ) : (
          <span>START</span>
        )}
      </Button>
    </div>
  );
}
