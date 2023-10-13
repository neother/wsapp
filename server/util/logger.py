import logging
import os
import time


class ExcludeFilter(logging.Filter):
    def filter(self, record):
        # Exclude log entries that contain '/db?' in the message
        return "GET" not in record.getMessage() and "POST" not in record.getMessage()


class Logger(object):
    def __init__(self):
        self.logger = logging.getLogger()
        self.logger.setLevel(logging.DEBUG)
        middle = time.strftime("%Y_%m_%d_%H_%M", time.localtime(time.time()))
        current_dir = os.getcwd()
        # print(current_dir)
        log_path = os.path.join(current_dir, "Logs/")
        # print(log_path)
        if not os.path.exists(log_path):
            os.makedirs(log_path)
        log_name = log_path + middle + ".log"
        fh = logging.FileHandler(log_name, mode="a", encoding="utf-8")
        fh.setLevel(logging.INFO)
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        formatter = logging.Formatter("%(asctime)s [%(threadName)s] - %(message)s")
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)

        # Add the custom filter to exclude log entries that contain '/db?' in the message
        exclude_filter = ExcludeFilter()
        fh.addFilter(exclude_filter)
        ch.addFilter(exclude_filter)

        self.logger.addHandler(fh)
        self.logger.addHandler(ch)

    def getlog(self):
        return self.logger


logger = Logger().getlog()
