import React, { Component, useState, useEffect } from "react";

import "./FuturesInfo.css";
import { tqsdkg } from "../util/tqsdkg";

export default function FuturesInfo(props) {
  // const [askPrice1, setAskPrice1] = useState();
  // const [askVolume1, setAskVolume1] = useState();
  // const [bidPrice1, setbidPrice1] = useState();
  // const [bidVolume1, setbidVolume1] = useState();

  // useEffect(() => {
  //   tqsdkg.subscribeQuotesSet = new Set();
  //   const quote = tqsdkg.getQuote(props.name);
  //   console.log("i am futures info:" + [...tqsdkg.subscribeQuotesSet]);
  //   const handleRtnData = () => {
  //     if (
  //       quote.bid_price1 !== undefined &&
  //       quote.bid_price1 !== "" &&
  //       quote.bid_price1 !== "-"
  //     ) {
  //       setAskPrice1(quote.ask_price1);
  //       setAskVolume1(quote.ask_volume1);
  //       setbidPrice1(quote.bid_price1);
  //       setbidVolume1(quote.bid_volume1);
  //     }
  //   };
  //   tqsdkg.on("rtn_data", handleRtnData);
  //   return () => {
  //     tqsdkg.off("rtn_data", handleRtnData);
  //   };
  // }, [props.name]);

  return (
    <div>
      <div className="f_info">
        <div className="price">{props.askPrice1}</div>
        <div className="volume">{props.askVolume1}</div>
      </div>
      <div className="f_info">
        <div className="price">{props.bidPrice1}</div>
        <div className="volume">{props.bidVolume1}</div>
      </div>
    </div>
  );
}
