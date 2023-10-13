import React, { Component } from "react";
import { useState, useEffect } from "react";
// import Form from "react-bootstrap/Form";
import Automation from "./Automation";
import { Toast, Table, Button, Modal, Form, ListGroup } from "react-bootstrap";
import { every } from "lodash";
import { baseURL } from "../properties/prop";

export default function ConfigAdmin() {
  const [contractors, setContractors] = useState([]);
  const [selectedDirection, setSelectedDirection] = useState("BUY");
  const [selectedContractor, setSelectedContractor] = useState("");
  const [tradeDirections, setTradeDirections] = useState([]);

  useEffect(() => {
    const url = "http://" + baseURL + ":4001/futures_names";
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
        setContractors(data.names);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const get_trade_direct = () => {
    const url = "http://" + baseURL + ":4001/get_trade_directions";
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
        setTradeDirections(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    get_trade_direct();
  }, []);

  const handleSubmit = (event) => {
    // Make API call to save the trade direction and selected contractor
    event.preventDefault();
    let url =
      "http://" +
      baseURL +
      ":4001/save_trade_direction" +
      "?name=" +
      selectedContractor +
      "&direction=" +
      selectedDirection;
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
        console.log(data);
        return data;
      })
      .catch((error) => {
        console.error(error);
      })
      .then((data) => {
        get_trade_direct();
      });
  };

  const handleDeleteAll = (event) => {
    // Make API call to save the trade direction and selected contractor
    event.preventDefault();
    let url = "http://" + baseURL + ":4001/delete_all_trade_directions";
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
        console.log(data);
        return data;
      })
      .catch((error) => {
        console.error(error);
      })
      .then((data) => {
        get_trade_direct();
      });
  };

  return (
    <div
      style={{
        border: "1px solid black",
        marginLeft: "2px",
        marginTop: "2px",
        padding: "10px",
        float: "left",
      }}
    >
      <Form.Group controlId="Contractor1" style={{ marginTop: "5px" }}>
        <Form.Label>Contractor</Form.Label>
        <Form.Control
          as="select"
          style={{ fontSize: "12px" }}
          value={selectedContractor}
          onChange={(e) => setSelectedContractor(e.target.value)}
        >
          <option>--</option>
          {contractors.map((contractor) => (
            <option key={contractor}>{contractor}</option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="Direction1">
        <Form.Label>Direction</Form.Label>

        <Form.Control
          as="select"
          value={selectedDirection}
          onChange={(e) => setSelectedDirection(e.target.value)}
          style={{ fontSize: "12px" }}
        >
          <option>AUTO</option>
          <option>BUY</option>
          <option>SELL</option>
          <option>STOP</option>
        </Form.Control>
      </Form.Group>

      <Button
        size="sm"
        variant="btn btn-info"
        type="submit"
        onClick={(event) => {
          handleSubmit(event);
        }}
      >
        SAVE
      </Button>

      <Button
        size="sm"
        variant="btn btn-danger"
        type="submit"
        style={{ marginLeft: "2px" }}
        onClick={(event) => {
          handleDeleteAll(event);
        }}
      >
        DeleteALL
      </Button>
      <hr></hr>
      <ListGroup variant="flush">
        {tradeDirections &&
          tradeDirections.map((t) => (
            <ListGroup.Item
              key={t.name}
              style={{
                padding: "0px 2px 0px 2px",
                fontSize: "small",
                // backgroundColor: "rgb(52, 61, 61)",
                color: "black",
              }}
              // onKeyDown={handleKey}
            >
              {t.name} - {t.direction}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </div>
  );
}
