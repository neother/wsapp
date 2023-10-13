import logging
import os
import time
import datetime


class Util(object):

    def covert_now_to_scaled_bar_time(self,scale):
    #2020-11-28 11:11:52
    # mins = time.strftime('%Y-%m-%d %H:%M:%S', datetime.datetime.now())
    # (datetime.datetime.now()+datetime.timedelta(minutes=1)

        new_bar_time = (datetime.datetime.now()+datetime.timedelta(minutes= -(datetime.datetime.now().minute%int(scale)))).strftime('%Y-%m-%d %H:%M:00')
        
        return new_bar_time

    
    def now(self):

        now = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
        return now
    
    