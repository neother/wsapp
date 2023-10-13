import datetime
from util.FID import FID


class Bar(object):
    def __init__(self, name, klines, index=-1):
        self.name = name
        self.time = str(
            datetime.datetime.fromtimestamp(klines.iloc[index]["datetime"] / 1e9)
        )
        # self.time = klines.iloc[index]["datetime"] / 1e9
        self.open_p = float(klines.iloc[index]["open"])
        self.high_p = float(klines.iloc[index]["high"])
        self.low_p = float(klines.iloc[index]["low"])
        self.close_p = float(klines.iloc[index]["close"])
        # self.position_change = float(klines.iloc[index]["close_oi"]) - float(
        # klines.iloc[index]["open_oi"]
        # )
        self.middle_p = (self.low_p + self.high_p) / 2
        self.third_p = (
            (self.low_p + self.high_p) * 2 / 3
            if self.status == -1
            else (self.low_p + self.high_p) / 3
        )
        self.index = index
        self.klines = klines
        self.down_shadow_length = (
            abs(self.close_p - self.low_p)
            if self.status == -1
            else abs(self.open_p - self.low_p)
        )
        self.up_shadow_length = (
            abs(self.high_p - self.open_p)
            if self.status == -1
            else abs(self.high_p - self.close_p)
        )
        self.solid_length = abs(self.open_p - self.close_p)
        self.amplitude = round(
            (
                float(klines.iloc[index]["close"])
                - float(klines.iloc[index - 1]["close"])
            )
            / float(klines.iloc[index - 1]["close"])
            * 100,
            2,
        )
        self.tick_size = self._get_FID_details_by_name(self.name)["tick_size"]

    def stop(self, action: str, loss_step=3):
        stop = (
            (self.high_p + self.tick_size * loss_step)
            if action.lower() in "sell"
            else (self.low_p - self.tick_size * loss_step)
        )
        return stop

    def profit(self, action: str, offset=15, percentage=0.7):
        profit = round(
            (
                min(
                    self.close_p - self.tick_size * 6,
                    self.lowest_price_history(offset)
                    - (self.close_p - self.lowest_price_history(offset)) * percentage,
                )
                if action.lower() in "sell"
                else max(
                    self.close_p + self.tick_size * 6,
                    self.highest_price_history(offset)
                    + (self.highest_price_history(offset) - self.close_p) * percentage,
                )
            )
        )
        return profit

    @property
    def is_jumped(self):
        current = Bar(self.name, self.klines, self.index)
        left = Bar(self.name, self.klines, self.index - 1)
        if (
            current.open_p >= (left.open_p + left.close_p) / 2
            or current.open_p >= left.open_p
        ):
            return True
        else:
            return False

    @property
    def status(self):
        """
        returns: 1/-1/0
        """
        s = 0
        if self.close_p > self.open_p:
            s = 1
        elif self.close_p < self.open_p:
            s = -1
        else:
            s = 0
        return s

    def _average_p(self, klines, times, index):
        ma_list = []
        for x in range(-1 * times + self.index + 1, self.index + 1):
            close_price = float(self.klines.iloc[x]["close"])
            ma_list.append(close_price)
        average = sum(ma_list) / times
        # logger.info('get the last average price MA[{}]: {}'.format(times,average))
        return average

    @property
    def ma_5(self):
        return self._average_p(self.klines, 5, self.index)

    @property
    def ma_10(self):
        return self._average_p(self.klines, 10, self.index)

    @property
    def ma_20(self):
        return self._average_p(self.klines, 20, self.index)

    @property
    def ma_40(self):
        return self._average_p(self.klines, 40, self.index)

    @property
    def ma_60(self):
        return self._average_p(self.klines, 60, self.index)

    def is_original_position_draw_back(self):
        """original is -1, it is still -1, not turn into 1
        vice versa
        """
        if self.status == -1:
            # return half
            return (self.close_p > (self.open_p + self.low_p) / 2) or (
                self.up_shadow_length >= self.solid_length
            )
        if self.status == 1:
            return (self.close_p < (self.open_p + self.high_p) / 2) or (
                self.down_shadow_length >= self.solid_length
            )

    def is_lowest_in_the_past(self, offset=4):
        lows = []
        for x in range(self.index - offset, self.index):
            lows.append(float(self.klines.iloc[x]["low"]))
        return self.klines.iloc[self.index]["low"] < min(lows)

    def is_highest_in_the_past(self, offset=4):
        highs = []
        for x in range(self.index - offset, self.index):
            highs.append(float(self.klines.iloc[x]["high"]))
        return self.klines.iloc[self.index]["high"] > max(highs)

    def lowest_price_history(self, offset=15):
        lows = []
        for x in range(self.index - offset, self.index):
            lows.append(float(self.klines.iloc[x]["low"]))
        return min(lows)

    def highest_price_history(self, offset=15):
        highs = []
        for x in range(self.index - offset, self.index):
            highs.append(float(self.klines.iloc[x]["high"]))
        return max(highs)

    @property
    def total_steps(self):
        #   {"name": "m2", "trade_unit": 10, "tick_size": 1},
        tick_size = 0
        total_step = 0
        pure_name = self.name.split(".")[1].split("_")[0]
        for i in FID:
            if i["name"] in pure_name:
                tick_size = i["tick_size"]
                break
        total_step = abs(self.high_p - self.low_p) / tick_size
        return total_step

    def _get_FID_details_by_name(self, name) -> dict:
        details = {}
        for i in FID:
            if i["name"] in name.split(".")[1]:
                details = i
                break
        return details
