const { dataTool } = require("echarts/lib/echarts");

const timestampToTime = (timestamp) => {
  const cache = new Map();
  if (cache.has(timestamp)) {
    return cache.get(timestamp);
  }
  var date = new Date(timestamp / 1000000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + "-";
  var M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  var D =
    date.getDate() < 10 ? "0" + date.getDate() + " " : date.getDate() + " ";
  var h = date.getHours().toString().padStart(2, 0) + ":";
  var m = date.getMinutes().toString().padStart(2, 0) + ":";
  var s = date.getSeconds().toString().padStart(2, 0);
  // console.log(date.getHours())
  let result = Y + M + D + h + m + s;
  cache.set(timestamp, result);
  return result;
};
// let stamp = 1604837365000000000

// let value = timestampToTime(stamp)
// console.log(value)
// var date = new Date(stamp /1000000)
// console.log(date.getDate())

module.exports = timestampToTime;
