import React, { Component, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Toast, Table, Button, Modal, Form } from "react-bootstrap";
import "./TradeOperation.css";
import { baseURL } from "../properties/prop";
import { tqsdkg } from "../util/tqsdkg";
import { backgroundColor } from "echarts/lib/theme/dark";

import Line from "./Line";
import { color } from "echarts/lib/theme/light";

export default function TradeOperation(props) {
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const [bidPrice1, setBidPrice1] = useState(props.bidPrice1);
  const [hasUserEditedPrice, setHasUserEditedPrice] = useState(false);
  const [isPriceEditable, setIsPriceEditable] = useState(false);
  const [fid, setFid] = useState([]);
  const [maxVol, setMaxVol] = useState(0);

  // useEffect(() => {
  //   tqsdkg.subscribeQuotesSet = new Set();
  //   const quote = tqsdkg.getQuote(props.name);
  //   console.log("i am trading operator:" + [...tqsdkg.subscribeQuotesSet]);
  //   const handleRtnData = () => {
  //     if (
  //       quote.bid_price1 !== undefined &&
  //       quote.bid_price1 !== "" &&
  //       quote.bid_price1 !== "-"
  //     ) {
  //       setBidPrice1(quote.bid_price1);
  //     }
  //   };
  //   tqsdkg.on("rtn_data", handleRtnData);
  //   return () => {
  //     tqsdkg.off("rtn_data", handleRtnData);
  //   };
  // }, [props.name]);

  const getFID = () => {
    const url = "http://" + baseURL + ":4001/fid";
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
        // console.log(data.fid);
        setFid(data.fid);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    getFID();
  }, []);

  useEffect(() => {
    setBidPrice1(props.bidPrice1);
  }, [props.name, props.bidPrice1]);

  useEffect(() => {
    setHasUserEditedPrice(false);
  }, [props.name, isPriceEditable]);

  useEffect(() => {
    if (!hasUserEditedPrice) {
      setPrice(bidPrice1);
    }
  }, [bidPrice1, isPriceEditable]);

  const calculateMaxVolForCurrentName = () => {
    let trade_unit = 0;
    fid.length > 0 &&
      fid.some((item) => {
        if (props.name && props.name.split(".")[1].includes(item.name)) {
          trade_unit = item.trade_unit;
          return true; // terminate the loop
        }
      });
    let tmp =
      props.account_details.available / (trade_unit * bidPrice1 * 0.2) - 1;

    let res = tmp > 1 ? tmp.toString().split(".")[0] : "0";
    // console.log(res);
    setMaxVol(res);
  };

  useEffect(() => {
    calculateMaxVolForCurrentName();
  }, [props.name, props.account_details, bidPrice1]);

  const handleOperation = (event, action, price, isEnforced, tradeVolume) => {
    event.preventDefault();
    let url =
      "http://" +
      baseURL +
      ":4001/trade?name=" +
      props.name +
      "&action=" +
      action +
      "&enforced=" +
      isEnforced +
      "&volume=" +
      tradeVolume +
      "&price=" +
      price +
      "&checked=" +
      isPriceEditable;

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
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCloseOperation = (event, isEnforced) => {
    event.preventDefault();
    let url =
      "http://" +
      baseURL +
      ":4001/close_positions?name=" +
      props.name +
      "&enforced=" +
      isEnforced +
      "&volume=" +
      volume;

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
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCloseAllOperation = (event, isEnforced) => {
    event.preventDefault();
    let url = "http://" + baseURL + ":4001/close_all_positions";
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
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCancelOperation = (event) => {
    event.preventDefault();
    let url =
      "http://" + baseURL + ":4001/cancel_orders_by_name?name=" + props.name;
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
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
    // console.log(price);
    setHasUserEditedPrice(true);
  };

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };

  const handleMaxVolumeSetup = (event) => {
    event.preventDefault();
    setVolume(maxVol);
  };

  const getInputBackgroupColor = () => {
    let color = isPriceEditable ? "white" : "grey";
    return color;
  };

  const handlePriceCheckboxChange = (event) => {
    // console.log(event.target.checked);
    setIsPriceEditable(event.target.checked);
  };

  const getStep = () => {
    let step = 1;
    fid &&
      fid.length > 0 &&
      fid.some((item) => {
        if (props.name && props.name.split(".")[1].includes(item.name)) {
          step = item.tick_size;
          return true; // terminate the loop
        }
      });

    return step;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginLeft: "5px",
        }}
      >
        <Form.Check
          type="checkbox"
          checked={isPriceEditable}
          onChange={handlePriceCheckboxChange}
        />
        <Button
          size="sm"
          variant="outline-info"
          type="submit"
          onClick={(event) => {
            handleMaxVolumeSetup(event);
          }}
          style={{
            padding: "3px",
            color: "wheat",
            borderColor: "wheat",
            marginBottom: "5px",
            marginRight: "5px",
            fontSize: "smaller",
          }}
        >
          Max Open Volume : {maxVol}
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          marginLeft: "5px",
          marginRight: "5px",
          marginBottom: "10px",
        }}
      >
        <div style={{ flex: 7 }}>
          <Form.Control
            type="number"
            placeholder="Price"
            value={isPriceEditable ? price : bidPrice1}
            size="sm"
            onChange={handlePriceChange}
            readOnly={!isPriceEditable}
            style={{
              backgroundColor: getInputBackgroupColor(),
              textAlign: "right",
            }}
            step={getStep()}
          />
        </div>
        <div style={{ flex: 5, marginLeft: "5px" }}>
          <Form.Control
            type="number"
            placeholder="Volume"
            value={volume}
            size="sm"
            onChange={handleVolumeChange}
            style={{ textAlign: "right" }}
          />
        </div>
      </div>

      <Line></Line>

      <div className="trade">
        <Button
          // disabled
          size="sm"
          variant="btn btn-danger"
          type="submit"
          onClick={(event) => {
            handleOperation(event, "BUY", price, "0", volume);
          }}
        >
          BUY
        </Button>

        <Button
          // disabled
          size="sm"
          variant="btn btn-success"
          type="submit"
          onClick={(event) => {
            handleOperation(event, "SELL", price, "0", volume);
          }}
        >
          SELL
        </Button>
        <Button
          size="sm"
          variant="btn btn-info"
          type="submit"
          onClick={(event) => {
            handleCloseOperation(event, "0", volume);
          }}
        >
          CLOSE
        </Button>
      </div>
      <div className="trade">
        <Button
          // disabled
          size="sm"
          variant="btn btn-danger"
          type="submit"
          onClick={(event) => {
            handleOperation(event, "BUY", price, "1", volume);
          }}
        >
          BUY+
        </Button>

        <Button
          // disabled
          size="sm"
          variant="btn btn-success"
          type="submit"
          onClick={(event) => {
            handleOperation(event, "SELL", price, "1", volume);
          }}
        >
          SELL+
        </Button>
        <Button
          size="sm"
          variant="btn btn-info"
          type="submit"
          onClick={(event) => {
            handleCloseOperation(event, "1", volume);
          }}
        >
          CLOSE+
        </Button>
      </div>

      <div className="trade">
        <Button
          size="sm"
          variant="btn btn-info"
          type="submit"
          onClick={(event) => {
            handleCloseAllOperation(event, "1", volume);
          }}
        >
          CLOSEALL
        </Button>
      </div>

      <div className="trade">
        <Button
          size="sm"
          variant="btn btn-secondary"
          type="submit"
          onClick={(event) => {
            handleCancelOperation(event);
          }}
        >
          CANCEL
        </Button>
      </div>
    </div>
  );
}
