from flask_cors import CORS
from flask_socketio import SocketIO, emit
import time
from flask import Flask, request
from flask import jsonify
from gevent import monkey
from flask import Flask
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
import time
from tqsdk import TqAccount, TqApi, TqAuth
from tqsdk.objs import Order, Position
import datetime
from model.bar import Bar
from util.logger import logger
from service.engine import Engine
from dao.dao import Dao
import threading
from model.record import FuturesRecord
import pandas as pd
from util.sound import *
from util.FID import FID
from util.config import *
from service.engine_factory import EngineFactory
import threading

dao = Dao()

app = Flask(__name__)
app.debug = True
CORS(app, resources=r"/*")

socketio = SocketIO(
    app, cors_allowed_origins="*", cors_allowed_methods="*", cors_allowed_headers="*"
)
now = time.strftime("H-%M-%S", time.localtime(time.time()))

engine = Engine()
api = TqApi(
    TqAccount("your own agent name", "account", "accountpsd"),
    auth=TqAuth("tsq_account", "tsq_psd"),
)
account = api.get_account()

auto = True


# update the contracts
ls = api.query_cont_quotes()
dao.save_contracts(ls)


@app.route("/contracts")
def get_contracts():
    result = {"contracts": dao.get_contracts()}
    return jsonify(result)


@app.route("/delete_records")
def delete_all():
    dao.delete_all()


@app.route("/drop_table")
def drop_table():
    dao.drop_table()


@app.route("/drop_holders")
def drop_holders():
    dao.drop_holders()


@app.route("/get_holders")
def get_holders():
    result = {"holders": get_latest_holder_names()}
    return jsonify(result)


@app.route("/switch_auto")
def swith_auto():
    global auto
    auto = not auto
    logger.info("auto status: {}".format(auto))
    result = {"status": auto}
    return jsonify(result)


@app.route("/auto_status")
def get_auto_status():
    global auto
    # logger.info("auto status: {}".format(auto))
    result = {"status": auto}
    return jsonify(result)


@app.route("/fid")
def get_fid():
    result = {"fid": FID}
    return jsonify(result)


def cancel_orders(name, action):
    """need to ensure the cancel order msg is returned from trade server, so that can place another order"""
    logger.info("trying to cancel {} {}".format(name, action))
    order_ids = searchOrderIds(name, action)

    if len(order_ids) > 0:
        for order in order_ids:
            logger.info(
                "cancel_orders for name: {}, action: {}, order_ids:{}".format(
                    name, action, order
                )
            )
            api.cancel_order(order)
            time.sleep(0.2)
            # wait_unit_order_changed(order)

    return order_ids


@app.route("/cancel_orders")
def cancel_order():
    name = request.args.get("name", "")
    price = request.args.get("price", "")
    action = request.args.get("action", "")
    result = {"name": name, "price": price, "action": action}
    # logger.info(get_total_alive_orders())
    play_cancel_sound()
    order_ids = searchOrderIds(name, action, price)
    for id in order_ids:
        api.cancel_order(id)
        logger.info("cancel_orders manually: {},{},{}".format(name, price, action))
    return jsonify(result)


@app.route("/cancel_orders_by_name")
def cancel_orders_by_name():
    name = request.args.get("name", "")
    play_cancel_sound()
    order_ids = searchOrderIdsByName(name)
    for id in order_ids:
        api.cancel_order(id)
        logger.info("cancel_orders_by_name: {}".format(name))
    return jsonify("ok")


def get_auto_offset(name, action):
    offset = "CLOSETODAY"
    ps = get_positions_by_name(name)
    if len(ps) > 0:
        # same direction will open a order
        if str(action).upper() in str(ps[0]["action"]).upper():
            offset = "OPEN"
        # different will close the order
        else:
            offset = "CLOSE" if "SHFE" in str(name).upper() else "CLOSE"
    else:
        offset = "OPEN"
    return offset


@app.route("/positions")
def api_get_positions():
    positions = get_positions()
    # logger.info("api_get_positions: {}".format(positions))
    result = {"positions": positions}
    return jsonify(result)


@app.route("/trade")
def trade():
    try:
        name = request.args.get("name", "")
        isEnforced = request.args.get("enforced", "0")
        action = str(request.args.get("action", "")).upper()
        volume = request.args.get("volume", "1")
        volume = 1 if volume == "" or int(volume) <= 0 else int(volume)
        price = request.args.get("price", "0")
        isChecked = request.args.get("checked", "false")
        price = (
            get_limit_price(name, action, isEnforced)
            if str(isChecked).lower() == "false"
            or str(action).upper() == "CLOSE"
            or price == ""
            or float(price) <= 0
            else float(price)
        )
        cancel_orders(name, action)
        offset = get_auto_offset(name, action)
        app_insert_order(name, action, offset, volume, price)
        result = {
            "name": name,
            "price": price,
            "offset": offset,
            "action": action,
            "volume": volume,
            "isEnforce": isEnforced,
            "isChecked": isChecked,
        }
        return jsonify(result)
    except Exception as e:
        logger.info(str(e))


def app_insert_order(name, action, offset, volume, price):
    logger.info(
        "app_insert_order: name : {}, price : {}, offset : {}, action : {}, volume : {}".format(
            name, price, offset, action, volume
        )
    )
    order = api.insert_order(name, action, offset, volume, price)

    count = 0
    # the order is returned from trade center (order.is_error in "None"), but not sure it's in pending order or finished order
    # while str(order.is_error) in "None" and count < 50:
    #     count += 1
    #     time.sleep(0.1)
    # if count == 50:
    #     logger.error("app_insert_order failed: {}".format(order))
    #     return order
    play_sound()
    logger.info(order)
    return order


def get_FID_details_by_name(name) -> dict:
    details = {}
    for i in FID:
        if i["name"] in name.split(".")[1]:
            details = i
            break
    return details


def get_limit_price(name, direction, isEnforced):
    limit_price = 0
    q = api.get_quote(name)
    # logger.info("api.get_quote: {}, {}".format(name, q))
    while str(q.ask_price1) == "nan" or str(q.bid_price1) == "nan":
        # logger.info("q.ask == nan wait...")
        time.sleep(0.1)

    details = get_FID_details_by_name(name)
    step = details["tick_size"]
    if isEnforced in "1":
        limit_price = (
            round(q.ask_price1 - step, 2)
            if str(direction).upper() in "SELL"
            else round(q.bid_price1 + step, 2)
        )
    else:
        limit_price = (
            round(q.ask_price1, 2)
            if str(direction).upper() in "SELL"
            else round(q.bid_price1, 2)
        )

    return limit_price


def do_close_positions(name, isEnforced, need_cancel=True):
    try:
        positions = get_positions_by_name(name)

        if len(positions) > 0:
            for single_position in positions:
                volume = (
                    single_position["volume"]
                    if single_position and single_position["volume"]
                    else 1
                )
                action = single_position["action"]
                # before clear position need to cancel any pending orders
                direction = "BUY" if str(action).lower() in "sell" else "SELL"
                if need_cancel:
                    cancel_orders(name, direction)

                offset = "CLOSETODAY" if "SHFE" in str(name).upper() else "CLOSE"
                limit_price = get_limit_price(name, direction, isEnforced)
                app_insert_order(name, direction, offset, volume, limit_price)
                s = "close position: {},{},{},{},{}, enforce: {}".format(
                    name, direction, offset, limit_price, volume, isEnforced
                )
                logger.info(s)

    except Exception as e:
        logger.info(str(e))


@app.route("/close_positions")
def close_positions():
    name = request.args.get("name", "")
    isEnforced = request.args.get("enforced", "")
    do_close_positions(name, isEnforced)
    return jsonify({"result": "OK"})


@app.route("/get_trade_directions")
def get_configured_trade_directions():
    result = dao.get_trade_directions()
    return jsonify(result)


def is_autoTrade_enabled(name):
    for d in directions_cache:
        if d["name"] == name:
            return d["direction"] == "AUTO"

    return False


@app.route("/save_trade_direction")
def configure_trade_direction():
    name = request.args.get("name", "")
    if not name or name == "" or name == "--":
        return jsonify("not saved, name error")
    direction = request.args.get("direction", "")

    for d in directions_cache:
        if d["name"] == name:
            d["direction"] = direction

    dao.save_trade_direction(name, direction)
    logger.info("save_trade_direction: {}  {}".format(name, direction))
    return jsonify("ok")


@app.route("/delete_trade_direction")
def delete_configured_trade_direction():
    name = request.args.get("name", "")
    dao.delete_trade_direction(name)
    return jsonify("ok")


@app.route("/delete_all_trade_directions")
def delete_all_trade_directions():
    dao.delete_all_trade_directions()
    return jsonify("ok")


@app.route("/db")
def get_trade_records():
    where = " where 1=1 "
    name = request.args.get("name", "")
    scale = request.args.get("scale", "")
    if name != "":
        where += ' and name = "{}" '.format(name)
    if scale != "":
        where += ' and scale = "{}" '.format(scale)
    sql = "select * from record" + where + " order by id desc limit 200"

    rows = dao.query_db(sql)
    result = [FuturesRecord(x).__dict__ for x in rows if len(rows) > 0]
    return jsonify(result)
    # except Exception as e:
    #     logger.info(str(e))


@app.route("/futures_names")
def api_get_futures_names():
    names = get_futures_names()
    result = {"names": names}
    return jsonify(result)


@app.route("/test_names")
def api_get_test_names():
    names = get_test_names()
    result = {"names": names}
    return jsonify(result)


def get_futures_names():
    name_list = []
    names = whole_names
    for name in names:
        for x in ls:
            if name in x:
                name_list.append(x)
    return name_list


def get_test_names():
    name_list = []
    names = test_names
    for name in names:
        for x in ls:
            if name in x:
                name_list.append(x)
    return name_list


subscribe_contract_name = ""
subscribe_scale = 1


@app.route("/subscribe_contract")
def subscribe_contract():
    name = request.args.get("name", "")
    scale = request.args.get("scale", "")
    subscribe_contract_name = name
    subscribe_scale = scale

    return jsonify({"name": subscribe_contract_name, "scale": subscribe_scale})


def get_whole_klines(width, scale_list):
    klines_list = []
    for scale in scale_list:
        for name in get_futures_names():
            try:
                klines = api.get_kline_serial(name, 60 * 1 * scale, data_length=width)
            except Exception as e:
                logger.info(str(e))
            # new_scale = str(scale) if scale != 1440 else "day"
            klines_list.append(
                {
                    "name": name + "_" + str(scale),
                    "klines": klines,
                }
            )
    return klines_list


def get_klines_by_name_scale(name, scale):
    klines = [x["klines"] for x in klines_list if x["name"] == name + "_" + str(scale)]
    # logger.info(klines[0])
    return klines[0]


def get_trade_klines():
    klines_list = []
    scale_list = [1]
    for scale in scale_list:
        for name in get_futures_names():
            try:
                klines = api.get_kline_serial(name, 60 * 1 * scale, data_length=300)
            except Exception as e:
                logger.info(str(e))
            klines_list.append(
                {
                    "name": name + "_" + str(scale),
                    "klines": klines,
                }
            )
    return klines_list


def find_full_name(name):
    for i in get_futures_names():
        if name in i:
            return i


def get_backtest_klines(name, scale_list, test_width):
    klines_list = []
    for scale in scale_list:
        if name == "all" or name == "":
            for name in get_test_names():
                try:
                    klines = api.get_kline_serial(name, 60 * 1 * int(scale), test_width)
                except Exception as e:
                    logger.info(str(e))
                klines_list.append(
                    {
                        "name": name + "_" + str(scale),
                        "klines": klines,
                    }
                )
        else:
            whole_name = find_full_name(name)
            try:
                klines = api.get_kline_serial(
                    whole_name, 60 * 1 * int(scale), test_width
                )
            except Exception as e:
                logger.info(str(e))
            klines_list.append(
                {
                    "name": whole_name + "_" + str(scale),
                    "klines": klines,
                }
            )

    return klines_list


def covert_pdKlines_to_json():
    name = "SHFE.rb2310"
    scale = 5
    data_list = []
    klines = api.get_kline_serial(name, 60 * 1 * scale, data_length=300)
    for i in range(len(klines)):
        data_list.append(
            {
                "name": name,
                "date": str(
                    datetime.datetime.fromtimestamp(klines.iloc[i]["datetime"] / 1e9)
                ),
                "open": klines.iloc[i]["open"],
                "close": klines.iloc[i]["close"],
                "high": klines.iloc[i]["high"],
                "low": klines.iloc[i]["low"],
            }
        )
    return {"klines": data_list}


# def get_trade_klines():
#     klines_list = []
#     scale_list = [5]
#     for scale in scale_list:
#         for name in get_trade_names():
#             try:
#                 klines = api.get_kline_serial(name, 60 * 1 * scale, data_length=250)
#             except Exception as e:
#                 logger.info(str(e))
#             klines_list.append({"name": name + "_" + str(scale), "klines": klines})
#     return klines_list


@socketio.on("connect")
def handle_connect():
    logger.info("Client connected")
    socketio.emit("connected", {"data": "Connected successfully"})


@socketio.on("disconnect")
def handle_disconnect():
    logger.info("Client disconnected")
    socketio.emit("disconnected", {"data": "Disconnected successfully"})


def get_volatility(klines_list, scale):
    volatilities = []
    for data in klines_list:
        if str(scale) == data["name"].split("_")[1]:
            current = Bar(data["name"], data["klines"])
            volatility = current.amplitude
            volatilities.append({"name": data["name"], "volatility": volatility})
            # logger.info(current.total_steps)
    return volatilities


def get_account_details():
    return {
        "static_balance": round(account.static_balance, 2),
        "balance": round(account.balance, 2),
        "available": round(account.available, 2),
        "float_profit": round(account.float_profit),
        "close_profit": round(account.close_profit),
        "commission": round(account.commission),
        "risk_ratio": round(account.risk_ratio, 2),
    }


def get_total_alive_orders():
    res = []
    entities = api.get_order()
    alive_orders = [
        order
        for order in entities.values()
        if order.status == "ALIVE" and order.insert_date_time != 0
    ]
    if len(alive_orders) > 0:
        res = alive_orders
    return res


def searchOrderIdsByName(name):
    order_ids = []
    totals = get_total_alive_orders()
    if len(totals) > 0:
        for i in totals:
            if str(i["instrument_id"]) in name:
                order_ids.append(i["order_id"])

    return order_ids


def searchOrderIds(name, action, price=None):
    order_ids = []
    totals = get_total_alive_orders()
    if len(totals) > 0:
        for i in totals:
            if (
                str(i["instrument_id"]) in name
                and str(i["direction"]).lower() in str(action).lower()
            ):
                if not price:
                    order_ids.append(i["order_id"])
                elif price and price in str(i["limit_price"]):
                    order_ids.append(i["order_id"])
    # logger.info(
    #     "search order_ids for {},{},{}, order_ids:{}".format(
    #         name, action, price, order_ids
    #     )
    # )
    return order_ids


def app_get_orders(status, num):
    entities = api.get_order()
    if status in "ALL":
        all_orders = [
            order for order in entities.values() if order.insert_date_time != 0
        ]
    else:  # FINISHED/ALIVE
        all_orders = [
            order
            for order in entities.values()
            if order.status == status
            and order.insert_date_time != 0
            and "平仓量超过持仓量" not in order.last_msg
            and "平今仓位不足" not in order.last_msg
        ]

    sorted_orders = sorted(
        all_orders, key=lambda order: order.insert_date_time, reverse=True
    )

    sorted_orders = sorted_orders[:num]
    return sorted_orders


def get_order_details_by_status(status="ALIVE"):
    res = []
    orders = app_get_orders(status, 100)
    # logger.info(orders)
    if len(orders) > 0:
        for o in orders:
            res.append(
                {
                    "order_id": o.order_id,
                    "name": o.exchange_id + "." + o.instrument_id,
                    "action": o.direction,
                    "open_price": o.limit_price,
                    "volume_orign": o.volume_orign,
                    "volume_left": o.volume_left,
                    "insert_date_time": datetime.datetime.fromtimestamp(
                        o.insert_date_time // 1000000000
                    ).strftime("%Y-%m-%d %H:%M:%S"),
                    "last_msg": o.last_msg,
                    "offset": o.offset,
                    "trade_price": 0
                    if str(o.trade_price) == "nan"
                    else round(o.trade_price, 2),
                    # "margin": 0
                    # if str(position.margin) == "nan"
                    # else round(position.margin),
                }
            )

    # logger.info("get_order_details:{}".format(res))
    return res


def get_positions_by_name(name):
    res = []
    positions = get_positions()

    for p in positions:
        if str(name).upper().split(".")[1] in str(p["name"]).upper():
            res.append(p)

    return res


def get_singel_position(name, action):
    position = None
    positions = get_positions()
    for p in positions:
        if name in p["name"] and str(action).lower() in str(p["action"]).lower():
            # if price and str(price) in str(p["open_price"]):
            position = p
            break

    # logger.info("get_singel_position: {}".format(p))
    return position


def get_positions():
    entities = api.get_position()
    # logger.info("api.get_position:{}".format(entities))
    res = []
    for k, v in entities.items():
        # logger.info(k)
        position = entities[k]
        if position.pos > 0:
            res.append(
                {
                    "name": position.exchange_id + "." + position.instrument_id,
                    "volume": position.volume_long,
                    "open_price": 0
                    if str(position.open_price_long) == "nan"
                    else round(position.open_price_long, 2),
                    "float_profit": 0
                    if str(position.float_profit_long) == "nan"
                    else round(position.float_profit_long, 2),
                    "action": "Buy",
                    "stop": 0,
                    "profit": 0,
                    "margin": 0
                    if str(position.margin) == "nan"
                    else round(position.margin),
                }
            )
        elif position.pos < 0:
            res.append(
                {
                    "name": position.exchange_id + "." + position.instrument_id,
                    "volume": position.volume_short,
                    "open_price": 0
                    if str(position.open_price_short) == "nan"
                    else round(position.open_price_short, 2),
                    "float_profit": 0
                    if str(position.float_profit_short) == "nan"
                    else round(position.float_profit_short, 2),
                    "action": "Sell",
                    "stop": 0,
                    "profit": 0,
                    "margin": 0
                    if str(position.margin) == "nan"
                    else round(position.margin),
                }
            )
    # logger.info("get_positions:{}".format(res))
    return res


def is_wait_update_required():
    now = datetime.datetime.now().time()
    return (
        0 <= datetime.datetime.weekday(datetime.datetime.now()) < 5
        and (
            (now >= datetime.time(8, 50) and now <= datetime.time(11, 30))
            or (now >= datetime.time(13, 25) and now <= datetime.time(15, 00))
            or (now >= datetime.time(20, 55) and now <= datetime.time(23, 00))
            or (now >= datetime.time(23, 00) and now <= datetime.time(23, 59))
            or (now >= datetime.time(0, 1) and now <= datetime.time(1, 59))
        )
        or (
            datetime.datetime.weekday(datetime.datetime.now()) == 5
            and now >= datetime.time(0, 1)
            and now <= datetime.time(2, 59)
        )
    )


def is_end_of_kline():
    now = datetime.datetime.now()
    seconds = [58]
    minutes = [4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59]
    hours = [9, 10, 11, 13, 14, 21, 22, 23, 0, 00, 1, 2]
    return (
        now.second in seconds and now.hour in hours and not is_end_of_today()
    )  # and now.minute in minutes


def is_market_opening():
    now = datetime.datetime.now().time()
    return (
        datetime.time(8, 58, 1) <= now == datetime.time(8, 58, 2)
        or datetime.time(10, 14, 2) <= now <= datetime.time(10, 14, 3)
        or datetime.time(10, 29, 2) <= now <= datetime.time(10, 29, 3)
        or datetime.time(11, 29, 2) <= now <= datetime.time(11, 29, 3)
        or datetime.time(13, 28, 2) <= now <= datetime.time(13, 28, 3)
        or datetime.time(14, 58, 2) <= now <= datetime.time(14, 58, 3)
        or datetime.time(20, 58, 2) <= now <= datetime.time(20, 58, 3)
        or datetime.time(22, 58, 2) <= now <= datetime.time(22, 58, 3)
    )


def market_open_and_close_time_prompt():
    if is_market_opening():
        play_cancel_sound()


def is_time_to_clear_inserted_orders():
    now = datetime.datetime.now()
    seconds = [10, 11, 12, 50, 51]  # time before insert the order
    return now.second in seconds


def is_end_of_today():
    now = datetime.datetime.now()
    seconds = [1]
    minutes = [59]
    hours = [14, 22]
    return now.second in seconds and now.hour in hours and now.minute in minutes


def is_start_of_today():
    now = datetime.datetime.now()
    seconds = [1]
    minutes = [0]
    hours = [9, 21]
    return now.second in seconds and now.hour in hours and now.minute in minutes


def handle_auto():
    global auto
    now = datetime.datetime.now()
    seconds = [1]
    end_minutes = [59]
    end_hours = [14, 22]

    start_minutes = [0]
    start_hours = [9, 21]

    if (
        now.second in seconds
        and now.hour in start_hours
        and now.minute in start_minutes
    ):
        logger.info("start auto for today")
        auto = True

    elif now.second in seconds and now.hour in end_hours and now.minute in end_minutes:
        logger.info("close auto for today")
        auto = False
    play_cancel_sound()
    logger.info("auto: {}".format(auto))


def is_end_of_1m():
    now = datetime.datetime.now()
    seconds = [58]
    return now.second in seconds


def get_latest_holder_names():
    return list(
        set(
            [x["name"] for x in get_order_details_by_status()]
            + [x["name"] for x in get_positions()]
        )
    )


@app.route("/reset_holders")
def reset_holders():
    logger.info("reset_holders")
    result = {"reset_holders": get_latest_holder_names()}
    return jsonify(result)


def get_volatilities():
    volatilities = {
        "volatilities_1_mins": get_volatility(klines_list, 1),
        "volatilities_five_mins": get_volatility(klines_list, 5),
        "volatilities_hour": get_volatility(klines_list, 60),
        "volatilities_day": get_volatility(klines_list, 1440),
    }
    return volatilities


directions_cache = dao.get_trade_directions()


@app.route("/aggregated_back_testing_result")
def caculate_back_testing_result():
    input_scale = request.args.get("scale", 1)
    res = []
    data = dao.get_back_test_record()
    if len(data) > 0:
        names = get_test_names()
        for name in names:
            for scale in [1, 5, 60, 60 * 24]:
                profits = []
                created_times = []
                lengths = []
                for d in data:
                    if name in d["name"]:
                        if str(scale) == d["scale"]:
                            profits.append(d["profit"])
                            created_times.append(d["created_time"])
                            lengths.append(d["length"])
                res.append(
                    {
                        "name": name,
                        "scale": scale,
                        "profits": profits,
                        "created_times": created_times,
                        "lengths": lengths,
                    }
                )
    updated_res = [x for x in res if str(x["scale"]) == str(input_scale)]
    return jsonify({"data": updated_res})


@app.route("/detailed_back_testing_result")
def get_detailed_back_testing_result():
    input_scale = request.args.get("scale", 1)
    input_name = request.args.get("name", "")
    if not input_name:
        names = get_test_names()
    else:
        names = [find_full_name(input_name)]

    total_result = []
    for name in names:
        sql = "select * from record where name = '{}' and scale = '{}' order by id asc".format(
            name, input_scale
        )
        rows = dao.query_db(sql)
        result = [FuturesRecord(x).__dict__ for x in rows if len(rows) > 0]
        if len(result) == 0:
            continue
        if result[-1]["offset"].lower() in "open":
            result = result[: len(result) - 1]
        res = []
        accumulated_res = []
        time_res = []
        lengths = []
        for x in range(1, len(result), 2):
            if result[x - 1]["action"] in "BUY":
                diff = float(result[x]["current_price"]) - float(
                    result[x - 1]["current_price"]
                )

            elif result[x - 1]["action"] in "SELL":
                diff = float(result[x - 1]["current_price"]) - float(
                    result[x]["current_price"]
                )

            res.append(diff)
            time_res.append(result[x]["time"])

        for x in range(0, len(res)):
            accumulated_res.append(sum(res[0 : x + 1]))
            lengths.append(x + 1)

        total_result.append(
            {
                "name": name,
                "data": accumulated_res,
                "length": lengths,
                "times": time_res,
                "scale": input_scale,
            }
        )

    return jsonify({"data": total_result})


@app.route("/back_testing_result")
def get_back_testing_result():
    data = dao.get_back_test_record()
    return jsonify({"data": data})


back_test_locker = False
engine_factory = EngineFactory()


def process_test_klines(data, need_save):
    back_test_records = []
    total_prices = []
    name = data["name"]
    pure_name = name.split("_")[0].split(".")[1]
    scale = name.split("_")[1]
    if need_save:
        sql = "delete from RECORD where name like '%{}%' and scale = '{}'".format(
            pure_name, scale
        )
        # logger.info(sql)
        dao.update_delete_db(sql)

    engine = engine_factory.create_engine(name)
    logger.info("back test: {} engine: {}".format(name, engine))

    for x in range(back_test, 0):
        if (
            len(back_test_records) == 0
            or len(back_test_records) > 0
            and back_test_records[-1]["name"] == name
            and back_test_records[-1]["offset"] == "CLOSE"
        ):  # latest record is closed
            record = engine.filter_engine(
                data["name"], data["klines"], x, need_save=need_save
            )
            if record:
                back_test_records.append(record)

        # check if the quit is met
        if (
            len(back_test_records) > 0
            and back_test_records[-1]["name"] == name
            and back_test_records[-1]["offset"] == "OPEN"
        ):
            record = engine.quit(
                data["name"],
                data["klines"],
                x,
                back_test_records[-1],
                need_save=need_save,
            )
            if record:
                back_test_records.append(record)

    if len(back_test_records) > 0:
        back_test_records = (
            back_test_records
            if back_test_records[-1]["offset"] == "CLOSE"
            else back_test_records[: len(back_test_records) - 1]
        )

        for x in back_test_records:
            if x["action"] == "BUY":
                total_prices.append(float(x["current_price"]) * -1)
            if x["action"] == "SELL":
                total_prices.append(float(x["current_price"]))

    single_result = {
        "name": name,
        "scale": str(name.split("_")[1]),
        "profit": round(sum(total_prices), 1),
        "length": len(total_prices) / 2,
    }
    if ".5" in str(single_result["length"]):
        logger.info(
            "offset is not in pair....offset is not in pair....offset is not in pair...."
        )

    logger.info(single_result)
    dao.save_back_test_record(single_result)


@app.route("/back_testing_delete")
def delete_back_test_record():
    dao.delete_back_test_record()
    return jsonify({"result": "ok"})


@app.route("/back_testing")
def back_testing():
    now = datetime.datetime.now()
    start_timestamp = now.timestamp()
    global back_test_locker
    back_test_locker = True
    name = request.args.get("name", "")
    scale = request.args.get("scale", 1)
    need_save = request.args.get("need_save", True)
    logger.info("start at {}".format(start_timestamp * 1000))
    logger.info(
        "back testing start : {}  {}, need_save:{}".format(name, scale, need_save)
    )

    scale_list = str(scale).split(",")
    test_klines = get_backtest_klines(name, scale_list, back_test_width)
    threads = []

    for data in test_klines:
        # Create a new thread for each data and start it
        # thread = threading.Thread(target=process_test_klines, args=(data, False))
        process_test_klines(data, True)
    #     thread.start()
    #     threads.append(thread)

    # # Wait for all threads to finish
    # for thread in threads:
    #     thread.join()

    now = datetime.datetime.now()
    end_timestamp = now.timestamp()
    logger.info("back testing stop")
    logger.info("end at {}".format(end_timestamp * 1000))
    logger.info(
        "time cost: {}, {} min".format(
            end_timestamp - start_timestamp,
            round((end_timestamp - start_timestamp) / 60),
            2,
        )
    )

    back_test_locker = False
    return jsonify({"data": "ok"})


def find_latest_opened_record(name, opened_records):
    res = None
    list(opened_records).reverse()
    for i in opened_records:
        if i["name"] == name:
            res = i
    return res


def emit_filtered_results():
    processed_result = []
    while True:
        # open order
        global back_test_locker
        if is_end_of_kline() and not back_test_locker:
            processed_result = []
            logger.info("start checking emitted result..")
            for data in klines_list:
                for x in range(-1, 0):
                    # if len(opened_records) == 0 or len(opened_records)>0 and
                    name = data["name"].split("_")[0]
                    if len(get_positions_by_name(name)) == 0:
                        record = engine_dict[name].filter_engine(
                            data["name"], data["klines"], x, need_save=True
                        )
                        if record:
                            processed_result.append(record)
                            logger.info(" {} : {}".format(name, engine_dict[name]))

            logger.info(
                "emit_filtered_results:{}".format([x["name"] for x in processed_result])
            )

        # close order
        positions = get_all_positions_with_quit_price()

        if is_wait_update_required() and not back_test_locker:
            if len(positions) > 0:
                # logger.info("checking quit")
                for p in positions:
                    if is_autoTrade_enabled(p["name"]):
                        engine.quit(
                            p["name"] + "_1",
                            get_klines_by_name_scale(p["name"], 1),
                            -1,
                            p,
                        )

        volatilities = get_volatilities()
        account_details = get_account_details()
        alive_order_details = get_order_details_by_status()
        finished_order_details = get_order_details_by_status("FINISHED")

        socketio.emit(
            "msg",
            {
                "data": processed_result,
                "volatilities": volatilities,
                "account": account_details,
                "positions": positions,
                "orders": alive_order_details,
                "finished_orders": finished_order_details,
            },
        )
        time.sleep(0.3)


def wait_unit_order_changed(order_id):
    logger.info("wait_unit_order_changed: {}".format(order_id))
    count = 0
    logger.info(api.get_order(order_id))
    while not api.is_changing(api.get_order(order_id), "last_msg") and count < 10:
        time.sleep(0.2)
        count += 1
    if count == 10:
        logger.error("order status is not changed")


def wait_until_holders_refreshed():
    current = get_latest_holder_names()
    logger.info("get current holder: {}".format(current))
    count = 0
    while True and count <= 60:
        if is_wait_update_required():
            api.wait_update()
        newer = get_latest_holder_names()
        logger.info("get newer holder: {}".format(newer))
        logger.info("waiting for holders refreshed")
        if newer != current:
            logger.info("holders refreshed, get_latest_holder_names: {}".format(newer))
            break
        time.sleep(0.1)
        count += 1


@app.route("/get_position_with_quit_price")
def controller_get_position_with_quit_price():
    return jsonify(get_all_positions_with_quit_price())


def get_all_positions_with_quit_price():
    ps = get_positions()
    res = []
    if len(ps) > 0:
        for p in ps:
            # logger.info(dao.get_records(p["name"], 1)[0]["stop"])

            r = dao.get_records(p["name"], str(p["action"]).upper(), 1)
            if len(r) > 0:
                p["stop"] = r[0]["stop"]
                p["profit"] = r[0]["profit"]
            res.append(p)

        # logger.info([x["name"] for x in res])
    return res


@app.route("/close_all_positions")
def close_all_positions():
    logger.info("close all the positions")
    positions = get_positions()
    if len(positions) > 0:
        for i in positions:
            do_close_positions(i["name"], "0", False)
    result = {"positions": [x["name"] for x in positions if len(positions) > 0]}
    return jsonify(result)


def check_quit_positions():
    positions_with_quit_price = get_all_positions_with_quit_price()
    names_in_pos = [
        x["name"]
        for x in positions_with_quit_price
        if len(positions_with_quit_price) > 0
    ]
    orders = get_order_details_by_status()
    names_in_orders = [x["name"] for x in orders if len(orders) > 0]
    # logger.info(names_in_orders)
    if len(positions_with_quit_price) > 0:
        for i in positions_with_quit_price:
            if is_autoTrade_enabled(i["name"]):
                if (
                    i["stop"]
                    and i["profit"]
                    and i["stop"] != "0"
                    and i["profit"] != "0"
                ):
                    bar = construct_latest_bar(i["name"])
                    # if len(names_in_orders) > 0:
                    if i["name"] not in names_in_orders and i["name"] in names_in_pos:
                        # stop
                        if str(i["action"]).lower() in "buy":
                            if float(bar.close_p) < float(i["stop"]) and float(
                                bar.close_p
                            ) < float(i["open_price"]):
                                logger.info("names_in_orders: " + str(names_in_orders))
                                logger.info("names_in_pos: " + str(names_in_pos))
                                if "oi" in str(i["name"]).lower():
                                    do_close_positions(i["name"], "1")
                                else:
                                    do_close_positions(i["name"], "0")

                        if str(i["action"]).lower() in "sell":
                            if float(bar.close_p) > float(i["stop"]) and float(
                                bar.close_p
                            ) > float(i["open_price"]):
                                logger.info("names_in_orders: " + str(names_in_orders))
                                logger.info("names_in_pos: " + str(names_in_pos))
                                if "oi" in str(i["name"]).lower():
                                    do_close_positions(i["name"], "1")
                                else:
                                    do_close_positions(i["name"], "0")

                        # profit
                        if str(i["action"]).lower() in "buy":
                            if (
                                float(bar.high_p) >= float(i["profit"])
                                and float(bar.close_p) > float(i["open_price"])
                                and is_end_of_1m()
                            ):  # or bar.highest_price_history(3) >= float(i["profit"]):
                                logger.info("names_in_orders: " + str(names_in_orders))
                                logger.info("names_in_pos: " + str(names_in_pos))
                                do_close_positions(i["name"], "0")

                        if str(i["action"]).lower() in "sell":
                            if (
                                float(bar.low_p) <= float(i["profit"])
                                and float(bar.close_p) < float(i["open_price"])
                                and is_end_of_1m()
                            ):  # or bar.lowest_price_history(3) <= float(i["profit"]):
                                logger.info("names_in_orders: " + str(names_in_orders))
                                logger.info("names_in_pos: " + str(names_in_pos))
                                do_close_positions(i["name"], "0")


def construct_latest_bar(name):
    for data in klines_list_to_trade:
        if name in data["name"]:
            bar = Bar(name, data["klines"], -1)
            return bar


waited_orders = []


def cancel_long_waited_orders():
    alive_orders = get_order_details_by_status()
    if len(alive_orders) > 0:
        for order in alive_orders:
            if order["name"] not in [
                x["name"] for x in waited_orders if len(waited_orders) > 0
            ]:
                waited_orders.append(
                    {
                        "name": order["name"],
                        "action": order["action"],
                        "offset": order["offset"],
                        "order_inserted_time": datetime.datetime.now(),
                    }
                )
    if len(waited_orders) > 0:
        for o in waited_orders:
            if is_autoTrade_enabled(o["name"]):
                waited_time = (
                    datetime.datetime.now() - o["order_inserted_time"]
                ).seconds
                if (
                    waited_time > 8
                    and "close" in str(o["offset"]).lower()
                    or waited_time > 45
                    and "open" in str(o["offset"]).lower()
                ):
                    cancel_orders(o["name"], o["action"])
                    waited_orders.remove(o)


inserted_order = []


def get_order_insert_price(action, quote):
    if str(action).lower() in "buy":
        price = (
            quote.bid_price1
            if quote.bid_volume1 < quote.ask_volume1 / 2 or quote.bid_volume1 <= 40
            else quote.ask_price1
        )
    elif str(action).lower() in "sell":
        price = (
            quote.ask_price1
            if quote.ask_price1 < quote.bid_volume1 / 2 or quote.ask_volume1 <= 40
            else quote.bid_price1
        )
    return price


def search_and_insert_order():
    while True:
        try:
            market_open_and_close_time_prompt()
            if is_wait_update_required():
                api.wait_update()

                if is_time_to_clear_inserted_orders():
                    inserted_order = []

                # handle_auto()

                if auto:
                    check_quit_positions()
                    cancel_long_waited_orders()

                if is_end_of_kline():
                    res = []
                    for data in klines_list_to_trade:
                        kline_name = data["name"].split("_")[0]

                        if (
                            len(get_positions_by_name(kline_name)) == 0
                            and len(searchOrderIdsByName(kline_name)) == 0
                        ):
                            record = engine_dict[kline_name].filter_engine(
                                data["name"], data["klines"], -1, need_save=False
                            )
                            if record is not None:
                                logger.info(
                                    "{} {}".format(kline_name, engine_dict[kline_name])
                                )
                                res.append(record)
                    logger.info(
                        "search_and_insert_order:{}".format([x["name"] for x in res])
                    )

                    if len(res) > 0:
                        play_monitor_sound()
                        if auto:
                            for r in res:
                                name = r["name"].split("_")[0]
                                if is_autoTrade_enabled(name):
                                    api.wait_update()
                                    if (
                                        name not in get_latest_holder_names()
                                        and name not in inserted_order
                                    ):
                                        q = api.get_quote(name)
                                        insert_price = get_order_insert_price(
                                            r["action"], q
                                        )
                                        order = api.insert_order(
                                            name, r["action"], "OPEN", 1, insert_price
                                        )
                                        logger.info(
                                            "auto trade: {},{},{},{},{}".format(
                                                name,
                                                r["action"],
                                                "OPEN",
                                                1,
                                                insert_price,
                                            )
                                        )
                                        inserted_order.append(name)
                                        api.wait_update()
                                        if order.is_error:
                                            time.sleep(3)
                                        # there will be a problem if the order is not successful, the order table and postision will be both empty. it will keep place the order.
                                        play_sound()

        except Exception as e:
            logger.info(e)


if __name__ == "__main__":
    klines_list = get_whole_klines(width, scale_list)
    klines_list_to_trade = get_trade_klines()

    engine_dict = engine_factory.init_engines(get_futures_names())

    t1 = threading.Thread(target=emit_filtered_results, daemon=True)
    t1.start()
    t2 = threading.Thread(target=search_and_insert_order)
    t2.start()
    server = pywsgi.WSGIServer(("0.0.0.0", 4001), app, handler_class=WebSocketHandler)
    logger.info("server start")
    logger.info("auto processing status: {}".format(auto))
    play_sound()
    play_monitor_sound()
    server.serve_forever()
