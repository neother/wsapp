import re
import requests
from util.logger import logger
import json
import datetime
import sqlite3
conn = sqlite3.connect('./records.db')
c = conn.cursor()
c.execute(
    '''CREATE TABLE IF NOT EXISTS RECORD
        (
            ID INT PRIMARY KEY     NOT NULL,
            NAME           TEXT    NOT NULL,
            TIME           TEXT     NOT NULL,
            ACTION        TEXT,
            CURRENT_PRICE         TEXT,
            REASON TEXT
        );
    '''
)
logger.info('db created')

result_dict = {
    'name':bar.name,
    'time':bar.time,
    'action':'Buy',
    'current_price':bar.close_p,
    'reason':condition_id
}

c.execute(
    """
    insert 

""")
conn.commit()
conn.close()