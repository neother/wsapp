import React, { Component, useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Card,
  Accordion,
  Tab,
} from "react-bootstrap";
import StockChart from "./StockChart";
import { baseURL } from "../properties/prop";

export default function StockRecord(props) {
  const [favorite, setFavorite] = useState(props.record.is_favorite);
  const toggleFavorite = () => {
    if (favorite == "0") {
      setFavorite("1");
    } else {
      setFavorite("0");
    }
  };

  const applyButtonStyle = (value) => {
    if (value == "1") {
      return "btn btn-info";
    } else {
      return "outline-dark";
    }
  };

  const handleDelete = (event) => {
    // event.preventDefault();
    event.stopPropagation();
    const url =
      "http://" + baseURL + ":8000/stocks/delete?id=" + props.record.id;
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    }).then((response) => {
      console.log("delete stock");
      props.handleDeleteRecord(props.record);
      return false;
      //   return "recheck done";
    });
  };

  const handleFavorite = (event) => {
    // event.preventDefault();
    event.stopPropagation();

    const url =
      "http://" + baseURL + ":8000/stocks/favorite?id=" + props.record.id;
    fetch(url, {
      method: "get",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        // 'mode': 'cors'
      },
    }).then((response) => {
      toggleFavorite();
      //   return "recheck done";
    });
  };

  const applyColor = (value) => {
    if (value != null) {
      return value.toString().includes("-") ? "green" : "red";
    } else {
      return "black";
    }
  };

  const getDisableStatus = () => {
    let isDisabled = false;
    return (isDisabled = favorite == "1" ? true : false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // console.log(props.recordIndex + "|||" + props.selectedRow);
      // console.log(props.isRecordSelected + " ::::  " + props.record.name);
      if (props.recordIndex === props.selectedRow && event.key === "f") {
        handleFavorite(event);
      } else if (
        props.recordIndex === props.selectedRow &&
        event.key === "Delete"
      ) {
        handleDelete(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [props.record.name]);

  return (
    <>
      <td>{props.record.code}</td>
      <td style={{ whiteSpace: "nowrap" }}>{props.record.name}</td>
      <td>{props.record.action}</td>
      <td style={{ whiteSpace: "nowrap" }}>
        {props.record.time.split(" ")[0]}
      </td>
      <td>{props.record.act_reason}</td>
      <td style={{ whiteSpace: "nowrap", fontSize: "11px" }}>
        {props.record.created_time.split("2023-")[1]}
      </td>
      <td
        style={{
          color: applyColor(props.record.raised_today),
          textAlign: "right",
        }}
      >
        {props.record.raised_today}
      </td>
      <td
        style={{
          color: applyColor(props.record.amplitude),
          textAlign: "right",
        }}
      >
        {props.record.amplitude}
      </td>
      <td style={{ whiteSpace: "nowrap" }}>
        <span> </span>
        <Button
          size="sm"
          variant={applyButtonStyle(favorite)}
          type="button"
          onClick={handleFavorite}
          style={{ fontSize: "10px", color: "wheat", borderColor: "wheat" }}
        >
          {favorite == "1" ? "-" : "+"}
        </Button>
        <span> </span>
        <Button
          size="sm"
          variant="outline-dark"
          type="button"
          disabled={getDisableStatus()}
          onClick={handleDelete}
          style={{ fontSize: "10px", color: "wheat", borderColor: "wheat" }}
        >
          D
        </Button>
      </td>
    </>
  );
}
