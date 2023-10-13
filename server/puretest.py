from random import randint
import json
import sys
import os
from flask_sockets import Sockets
import time
from gevent import monkey
from flask import Flask
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
import time
import datetime
from model.bar import Bar
from util.logger import logger
from service.engine import Engine
import random

sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/' + '..'))
sys.path.append("..")


app = Flask(__name__)
app.debug = True
sockets = Sockets(app)
now = time.strftime('%Y-%m-%d-%H-%M-%S', time.localtime(time.time()))


@sockets.route('/records')  # 指定路由
def echo_socket(ws):

    records = [
  {
    "volatilities_hour": [
      {
        "name": "SHFE.rb2105_60",
        "volatility": 2.14
      },
      {
        "name": "DCE.i2105_60",
        "volatility": 1.06
      },
      {
        "name": "SHFE.ag2106_60",
        "volatility": 0.15
      },
      {
        "name": "SHFE.fu2105_60",
        "volatility": 0.93
      },
      {
        "name": "SHFE.ru2105_60",
        "volatility": -0.03
      },
      {
        "name": "CZCE.TA105_60",
        "volatility": 0.33
      },
      {
        "name": "CZCE.MA105_60",
        "volatility": 0.04
      },
      {
        "name": "CZCE.FG105_60",
        "volatility": 1.88
      },
      {
        "name": "SHFE.bu2106_60",
        "volatility": 0.64
      },
      {
        "name": "DCE.m2105_60",
        "volatility": 0.86
      },
      {
        "name": "CZCE.RM105_60",
        "volatility": 1.33
      },
      {
        "name": "DCE.y2105_60",
        "volatility": 0.65
      },
      {
        "name": "DCE.p2105_60",
        "volatility": 1.07
      },
      {
        "name": "CZCE.OI105_60",
        "volatility": 1.33
      },
      {
        "name": "CZCE.SR105_60",
        "volatility": 0.04
      },
      {
        "name": "DCE.c2105_60",
        "volatility": 0.15
      },
      {
        "name": "CZCE.CF105_60",
        "volatility": 0.95
      },
      {
        "name": "CZCE.SA105_60",
        "volatility": 0.96
      },
      {
        "name": "SHFE.sp2105_60",
        "volatility": 0.23
      },
      {
        "name": "SHFE.zn2105_60",
        "volatility": 0.11
      },
      {
        "name": "SHFE.cu2105_60",
        "volatility": 0.22
      }
    ],
    "volatilities_day": [
      {
        "name": "SHFE.rb2105_1440",
        "volatility": 2.4
      },
      {
        "name": "DCE.i2105_1440",
        "volatility": 0.86
      },
      {
        "name": "SHFE.ag2106_1440",
        "volatility": 0.35
      },
      {
        "name": "SHFE.fu2105_1440",
        "volatility": 1.66
      },
      {
        "name": "SHFE.ru2105_1440",
        "volatility": 0.63
      },
      {
        "name": "CZCE.TA105_1440",
        "volatility": 0.23
      },
      {
        "name": "CZCE.MA105_1440",
        "volatility": -0.26
      },
      {
        "name": "CZCE.FG105_1440",
        "volatility": 2.68
      },
      {
        "name": "SHFE.bu2106_1440",
        "volatility": 0.92
      },
      {
        "name": "DCE.m2105_1440",
        "volatility": 1.36
      },
      {
        "name": "CZCE.RM105_1440",
        "volatility": 0.87
      },
      {
        "name": "DCE.y2105_1440",
        "volatility": 1.24
      },
      {
        "name": "DCE.p2105_1440",
        "volatility": 1.62
      },
      {
        "name": "CZCE.OI105_1440",
        "volatility": 1.39
      },
      {
        "name": "CZCE.SR105_1440",
        "volatility": 0.3
      },
      {
        "name": "DCE.c2105_1440",
        "volatility": 0.44
      },
      {
        "name": "CZCE.CF105_1440",
        "volatility": 0.85
      },
      {
        "name": "CZCE.SA105_1440",
        "volatility": 2.47
      },
      {
        "name": "SHFE.sp2105_1440",
        "volatility": 0.85
      },
      {
        "name": "SHFE.zn2105_1440",
        "volatility": 1.96
      },
      {
        "name": "SHFE.cu2105_1440",
        "volatility": 1.56
      }
    ]
  },
  {
    "name": "SHFE.ru2105_5",
    "scale": "5",
    "time": "2021-03-19 22:55:00",
    "action": "SELL",
    "current_price": 14455.0,
    "reason": 2
  },
  {
    "name": "DCE.m2105_5",
    "scale": "5",
    "time": "2021-03-19 22:55:00",
    "action": "BUY",
    "current_price": 3287.0,
    "reason": 1
  },
  {
    "name": "CZCE.OI105_5",
    "scale": "5",
    "time": "2021-03-19 22:55:00",
    "action": "BUY",
    "current_price": 10509.0,
    "reason": 1
  },
  {
    "name": "DCE.c2105_5",
    "scale": "5",
    "time": "2021-03-19 22:55:00",
    "action": "BUY",
    "current_price": 2718.0,
    "reason": 1
  },
  {
    "name": "SHFE.cu2105_5",
    "scale": "5",
    "time": "2021-03-20 00:55:00",
    "action": "BUY",
    "current_price": 67050.0,
    "reason": 1
  },
  {
    "name": "DCE.c2105_15",
    "scale": "15",
    "time": "2021-03-19 22:45:00",
    "action": "BUY",
    "current_price": 2718.0,
    "reason": 1
  },
  {
    "name": "SHFE.ag2106_60",
    "scale": "60",
    "time": "2021-03-20 02:00:00",
    "action": "BUY",
    "current_price": 5465.0,
    "reason": 1
  },
  {
    "name": "CZCE.FG105_1440",
    "scale": "1440",
    "time": "2021-03-22 00:00:00",
    "action": "BUY",
    "current_price": 2110.0,
    "reason": 1
  }
]
    while True:
        msg_to_be_sent = records

        ws.send(json.dumps(msg_to_be_sent))  # 回传给clicent
        logger.info(json.dumps(msg_to_be_sent))
        logger.info('\n')
        time.sleep(5)
        

    message = ws.receive()
    logger.info(message)

@app.route('/')
def hello():
    return 'Hello World! server start！'


if __name__ == "__main__":

    server = pywsgi.WSGIServer(
        ('0.0.0.0', 4000), app, handler_class=WebSocketHandler)
    print('server start')
    server.serve_forever()
