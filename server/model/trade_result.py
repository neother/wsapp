import datetime


class TradeResult(object):

    def __init__(self, name, time, action):
        self.name = name
        self.time = time
        self.action = action
