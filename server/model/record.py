import datetime
from util.stocks_name import stocks


class FuturesRecord(object):
    def __init__(self, row):
        self.id = row[0]
        self.name = row[1]
        self.scale = row[2]
        self.time = row[3]
        self.action = row[4]
        self.current_price = row[5]
        self.reason = row[6]
        self.created_time = row[7]
        self.profit = row[8]
        self.stop = row[9]
        self.offset = row[10]
