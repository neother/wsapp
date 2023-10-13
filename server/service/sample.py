from service.base_service import BaseService
from model.bar import Bar
from util.FID import FID
from util.logger import logger

loss_step = 3
service = BaseService()


class Engine(object):
    def __init__(self) -> None:
        logger.info(self.__class__.__name__)

    def filter_engine(self, name, price_list, index, need_save=True):
        bar = Bar(name, price_list, index)
        bar_left_1 = Bar(name, price_list, index - 1)
        bar_left_2 = Bar(name, price_list, index - 2)

        if bar.ma_5 < bar.ma_10:
            return service.buy(
                bar,
                "2-111",  # customized trade reason code
                bar.stop("buy"),
                bar.profit("buy"),
                need_save=need_save,
            )

        if bar.ma_5 > bar.ma_10:
            return service.sell(
                bar,
                "2-000",  # customized trade reason code
                bar.stop("sell"),
                bar.profit("sell"),
                need_save=need_save,
            )

    def quit(self, name, price_list, x, record, need_save=True):
        if float(record["profit"]) != 0 and float(record["stop"]) != 0:
            res = []
            bar = Bar(name, price_list, x)
            if str(record["action"]).upper() in "SELL":
                if bar.low_p <= float(record["profit"]):
                    res = service.buy(bar, "quit", 0, 0, "CLOSE", need_save=need_save)
                if bar.high_p > float(record["stop"]):
                    res = service.buy(
                        bar,
                        "quit",
                        0,
                        0,
                        "CLOSE",
                        float(record["stop"]) + bar.tick_size,
                        need_save=need_save,
                    )

            if str(record["action"]).upper() in "BUY":
                if bar.high_p >= float(record["profit"]):
                    res = service.sell(bar, "quit", 0, 0, "CLOSE", need_save=need_save)
                if bar.low_p < float(record["stop"]):
                    res = service.sell(
                        bar,
                        "quit",
                        0,
                        0,
                        "CLOSE",
                        float(record["stop"]) - bar.tick_size,
                        need_save=need_save,
                    )

            return res
