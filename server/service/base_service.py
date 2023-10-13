import re

from util.logger import logger
import json
import datetime
from dao.dao import Dao
import datetime
from util.util import Util

dao = Dao()


class BaseService(object):
    def buy(
        self,
        bar,
        condition_id,
        stop_price,
        profit_price,
        offset="OPEN",
        act_price=None,
        need_save=True,
    ):
        double_win = bar.close_p + ((bar.close_p - bar.open_p) * 2)
        signle_win = bar.close_p + ((bar.close_p - bar.open_p))
        result_string = (
            "{} ({}  BUY). profit between {} - {}, stop at {} -- condition {}".format(
                bar.time, bar.name, signle_win, double_win, bar.open_p, condition_id
            )
        )

        result_dict = {
            "name": bar.name,
            "scale": bar.name.split("_")[1],
            "time": bar.time,
            "action": "BUY",
            "created_time": Util().now(),
            "current_price": bar.close_p if not act_price else act_price,
            "reason": condition_id,
            "profit": profit_price,
            "stop": stop_price,
            "offset": offset,
        }

        if need_save:
            dao.save_records(result_dict)

        return result_dict

    def sell(
        self,
        bar,
        condition_id,
        stop_price,
        profit_price,
        offset="OPEN",
        act_price=None,
        need_save=True,
    ):
        double_win = bar.close_p - ((bar.open_p - bar.close_p) * 2)
        signle_win = bar.close_p - ((bar.open_p - bar.close_p))
        result_string = (
            "{} ({}  SELL). profit  between {} - {}, stop at {} -- condition {}".format(
                bar.time, bar.name, signle_win, double_win, bar.open_p, condition_id
            )
        )
        # logger.info(result_string)
        result_dict = {
            "name": bar.name,
            "scale": bar.name.split("_")[1],
            "time": bar.time,
            "action": "SELL",
            "created_time": Util().now(),
            "current_price": bar.close_p if not act_price else act_price,
            "reason": condition_id,
            "profit": profit_price,
            "stop": stop_price,
            "offset": offset,
        }

        if need_save:
            dao.save_records(result_dict)
        return result_dict

    def save_trade_diretion(name, direction):
        dao.save_trade_direction(name, direction)
