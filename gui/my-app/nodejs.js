const TQSDK = require('tqsdk/dist/umd/tqsdk-nocache')
const WebSocket = require('ws')
const tqsdk = new TQSDK({}, {WebSocket})

tqsdk.setChart({symbol: 'SHFE.ag2012', duration: 60 * 1e9, view_width: 2})
tqsdk.on('rtn_data', function(){

  let lines = tqsdk.getKlines('SHFE.ag2012', 60 * 1e9)
  console.log(lines)
  let lines2 = tqsdk.getKlines('SHFE.ag2012', 60 * 1e9)
  console.log(lines2)
}
)