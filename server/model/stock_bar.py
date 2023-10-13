import datetime
from util.stocks_name import stocks


class StockBar(object):

    def __init__(self, code, klines, index=-1):

        self.code = code
        self.name = stocks[code]
        self.time = str(klines[index]["date"])
        self.open_p = float(klines[index]['open'])
        self.high_p = float(klines[index]['high'])
        self.low_p = float(klines[index]['low'])
        self.close_p = float(klines[index]['close'])
        self.middle_p = (self.low_p+self.high_p)/2
        self.index = index
        self.klines = klines
        self.low_shadow_length = abs(self.close_p - self.low_p) if self.status == -1 else abs(self.open_p - self.low_p)
        self.high_shadow_length = abs(self.high_p - self.open_p) if self.status == -1 else abs(self.high_p - self.close_p)
        self.solid_length = abs(self.open_p - self.close_p)
        self.tran_amount = float(klines[index]['tran_amount'])
        self.tran_volume = float(klines[index]['tran_volume'])/100
        self.rise = float(klines[index]['rise'])

    @property
    def is_jumped(self):
        current = StockBar(self.code, self.klines, self.index)
        left = StockBar(self.code, self.klines, self.index-1)
        if current.status >= 0:
            if current.open_p >= (left.open_p+left.close_p)/2 or current.open_p >= left.open_p:
                return True
            else:
                return False
        else:
            if current.open_p <= (left.open_p+left.close_p)/2 or current.open_p <= left.open_p:
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
        for x in range(-1*times+self.index+1, self.index+1):
            close_price = float(self.klines[x]['close'])
            ma_list.append(close_price)
        average = sum(ma_list)/times
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
    def ma_60(self):
        return self._average_p(self.klines, 60, self.index)

    def is_original_position_draw_back(self):
        if self.status == -1:
            if (self.close_p > (self.open_p+self.low_p)/2) or (self.high_shadow_length >= self.solid_length):
                return True
            else:
                return False
        if self.status == 1:
            if (self.close_p < (self.open_p+self.high_p)/2) or (self.low_shadow_length >=self.solid_length):
                return True
            else:
                return False

    def is_lowest_in_the_past(self):

        lows = []
        offset = 4
        for x in range(self.index-offset,self.index+1):
            lows.append(float(self.klines[x]['low']))
        return True if lows.index(min(lows)) == offset else False
    
    def is_highest_in_the_past(self):

        highs = []
        offset = 4
        for x in range(self.index-offset,self.index+1):
            highs.append(float(self.klines[x]['high']))
        if highs.index(max(highs)) == offset:
            return True
        else:
            return False
        
