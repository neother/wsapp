
import time


class StockResult(object):

    def __init__(self,code, name,price,reason):

        self.code = code
        self.name = name
        self.price = price
        self.created_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
        self.current_price= price
        self.reason = reason
