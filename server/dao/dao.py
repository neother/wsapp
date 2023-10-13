import datetime
import sqlite3
from util.logger import logger
import time
from util.util import Util

util = Util()


class Dao(object):
    def __init__(self):
        conn = sqlite3.connect("./records.db")
        c = conn.cursor()
        c.execute(
            """CREATE TABLE IF NOT EXISTS RECORD
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NAME           TEXT    NOT NULL,
                SCALE  TEXT NOT NULL,
                TIME           TEXT     NOT NULL,
                ACTION        TEXT,
                CURRENT_PRICE         TEXT,
                REASON TEXT,
                CREATED_TIME TEXT           ,
                PROFIT TEXT , 
                STOP  TEXT,
                OFFSET TEXT
                );
            """
        )

        c.execute(
            """CREATE INDEX IF NOT EXISTS record_id_idx ON RECORD (ID);
            """
        )

        c.execute(
            """CREATE INDEX IF NOT EXISTS idx_scale ON RECORD(scale);
            """
        )

        c.execute(
            """CREATE TABLE IF NOT EXISTS HOLDERS
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NAME           TEXT    NOT NULL,
                SCALE  TEXT,
                TIME           TEXT,
                ACTION        TEXT,
                CURRENT_PRICE         TEXT,
                REASON TEXT,
                CREATED_TIME TEXT           ,
                PROFIT TEXT , 
                STOP  TEXT
                );
            """
        )
        # c.execute(
        # """DROP TABLE TRADE_DIRECTION
        # """
        # )
        c.execute(
            """CREATE TABLE IF NOT EXISTS TRADE_DIRECTION
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NAME           TEXT    NOT NULL,
                DIRECTION        TEXT
                );
            """
        )

        c.execute(
            """CREATE TABLE IF NOT EXISTS AUTO_RECORD
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NAME           TEXT    NOT NULL,
                SCALE  TEXT,
                TIME           TEXT,
                ACTION        TEXT,
                CURRENT_PRICE         TEXT,
                REASON TEXT,
                CREATED_TIME TEXT           ,
                PROFIT TEXT , 
                STOP  TEXT
                );
            """
        )

        c.execute(
            """CREATE TABLE IF NOT EXISTS ALERT
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NAME           TEXT    NOT NULL,
                OPERATION      TEXT NOT NULL,
                PRICE         TEXT
                );
            """
        )
        c.execute(
            """CREATE TABLE IF NOT EXISTS STOCKS
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code           TEXT    NOT NULL,
                name           TEXT    NOT NULL,
                price           TEXT    NOT NULL,
                created_time TEXT,
                amplitude       TEXT NOT NULL,
                current_price       TEXT NOT NULL,
                reason TEXT NOT NULL
                );
            """
        )
        c.execute(
            """CREATE TABLE IF NOT EXISTS CONTRACTS
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name           TEXT    NOT NULL     
            );
            """
        )

        c.execute(
            """CREATE TABLE IF NOT EXISTS BACKTEST
            (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NAME           TEXT    NOT NULL,
                SCALE  TEXT NOT NULL,
                PROFIT TEXT NOT NULL,
                LENGTH TEXT NOT NULL,
                CREATED_TIME TEXT  
                );
            """
        )

        logger.info("db init...")
        conn.commit()
        conn.close()

    def get_db(self):
        db = sqlite3.connect("./records.db")
        db.row_factory = sqlite3.Row
        return db

    def query_db(self, query):
        db = self.get_db()
        try:
            # logger.info(query)
            cur = db.execute(query)
            rv = cur.fetchall()
            return rv
        finally:
            db.close()

    def insert_db(self, query, args):
        db = self.get_db()
        try:
            cur = db.execute(query, args)
            # logger.info(str(query) + str(args))
            db.commit()
        except Exception as e:
            logger.info(str(e))
        finally:
            db.close()

    def update_delete_db(self, sql):
        db = self.get_db()
        try:
            cur = db.execute(sql)
            # logger.info(sql)
            db.commit()
        except Exception as e:
            logger.info(str(e))
        finally:
            db.close()

    def get_records(self, name, action, scale):
        records = []
        sql = "select * from RECORD where name = '{}' and action = '{}' and scale = '{}'  and time >= date('now', '-1 days') order by time desc".format(
            name, action, scale
        )
        # logger.info(sql)
        rows = self.query_db(sql)

        if len(rows) > 0:
            # name,scale,time,action,current_price,reason,created_time,profit,stop
            records = [
                {
                    "name": row[1],
                    "scale": row[2],
                    "time": row[3],
                    "action": row[4],
                    "current_price": row[5],
                    "reason": row[6],
                    "created_time": row[7],
                    "profit": row[8],
                    "stop": row[9],
                    "offset": row[10],
                }
                for row in rows
            ]

        return records

    def save_records(self, d):
        name = d["name"].split("_")[0]
        scale = d["scale"]
        bar_time = d["time"]
        action = d["action"]
        reason = str(d["reason"]) + " map" + scale
        current_price = d["current_price"]
        profit = d["profit"]
        stop = d["stop"]
        offset = d["offset"]
        rows = self.query_db(
            "select * from RECORD where name ='{}' and scale ='{}' and time = '{}' and action='{}'".format(
                name, scale, bar_time, action
            )
        )

        if len(rows) == 0:
            sql = "INSERT INTO RECORD(name,scale,time,action,current_price,reason,created_time,profit,stop,offset) VALUES (?,?,?,?,?,?,?,?,?,?)"

            self.insert_db(
                sql,
                (
                    name,
                    scale,
                    bar_time,
                    action,
                    current_price,
                    reason,
                    util.now(),
                    profit,
                    stop,
                    offset,
                ),
            )
        else:
            pass
            # sql = "update RECORD set current_price = '{}', stop='{}', profit='{}' where name ='{}' and scale ='{}' and time = '{}' and action='{}'".format(
            #     current_price, stop, profit, name, scale, bar_time, action
            # )
            # self.update_delete_db(sql)

    def get_auto_records(self, name, scale, action):
        pass

    def save_auto_records(self, d):
        name = d["name"].split("_")[0]
        scale = d["scale"]
        bar_time = d["time"]
        action = d["action"]
        rows = self.query_db(
            "select * from AUTO_RECORD where name ='{}' and action='{}'".format(
                name, action
            )
        )
        # logger.info("row lenght:"+str(len(rows)))
        if len(rows) == 0:
            sql = "INSERT INTO AUTO_RECORD(name,scale,time,action,current_price,reason,created_time,profit,stop) VALUES (?,?,?,?,?,?,?,?,?)"
            self.insert_db(
                sql,
                (
                    name,
                    scale,
                    bar_time,
                    d["action"],
                    d["current_price"],
                    str(d["reason"]) + " map" + scale,
                    util.now(),
                    d["profit"],
                    d["stop"],
                ),
            )
        else:
            pass

    def existed_in_holders(self, name):
        rows = self.query_db("select * from HOLDERS where name ='{}'".format(name))
        return len(rows) > 0

    def save_holders(self, name):
        sql = "INSERT INTO HOLDERS(name) VALUES (?)"
        self.insert_db(
            sql,
            (name,),
        )

    def save_contracts(self, names):
        # logger.info("save_contracts:{}".format(names))
        if names:
            sql = "INSERT INTO CONTRACTS(name) VALUES(?)"
            for name in names:
                s_sql = "select name from CONTRACTS where name = '{}'".format(name)
                rows = self.query_db(s_sql)
                if len(rows) > 1:
                    pass
                    # logger.info("{} already exist".format(name))
                else:
                    self.insert_db(sql, (name,))
        else:
            logger.error("names is None")
        logger.info("saved lastest contracts.")

    def get_contracts(self):
        sql = "select name from CONTRACTS"
        rows = self.query_db(sql)
        result = list(set(row["name"] for row in rows))
        # logger.info("get_contracts: {}".format(result))

        if len(result) > 0:
            return result
        return []

    def save_trade_direction(self, name, direction):
        sql = "select name,direction from TRADE_DIRECTION where name = '{}'".format(
            name
        )
        rows = self.query_db(sql)
        if len(rows) > 0:
            update_sql = (
                "update TRADE_DIRECTION set direction = '{}' where name = '{}'".format(
                    direction, name
                )
            )
            self.update_delete_db(update_sql)
        else:
            insert_sql = "INSERT INTO TRADE_DIRECTION(name,direction) VALUES(?,?)"
            self.insert_db(insert_sql, (name, direction))

    def get_trade_directions(self):
        result = []
        sql = "select name,direction from TRADE_DIRECTION"
        rows = self.query_db(sql)
        if len(rows) > 0:
            result = [{"name": row[0], "direction": row[1]} for row in rows]
        return result

    def delete_trade_direction(self, name):
        sql = "delete from TRADE_DIRECTION where name = '{}'".format(name)
        self.update_delete_db(sql)

    def delete_all_trade_directions(self):
        sql = "delete from TRADE_DIRECTION"
        self.update_delete_db(sql)

    def delete_all(self):
        sql = "delete from RECORD"
        self.update_delete_db(sql)

    def delete_records_by_name(self, name):
        sql = "delete from RECORD where name like '%{}%'".format(name)
        self.update_delete_db(sql)

    def drop_table(self):
        sql = "drop table RECORD"
        self.update_delete_db(sql)

    def drop_holders(self):
        sql = "drop table HOLDERS"
        self.update_delete_db(sql)

    def get_back_test_record(self):
        sql = "select * from BACKTEST order by created_time asc"
        rows = self.query_db(sql)
        records = []
        if len(rows) > 0:
            records = [
                {
                    "name": row[1],
                    "scale": row[2],
                    "profit": row[3],
                    "length": row[4],
                    "created_time": row[5],
                }
                for row in rows
            ]
            return records

    def save_back_test_record(self, record):
        insert_sql = "INSERT INTO BACKTEST(name,scale,profit,length,created_time) VALUES(?,?,?,?,?)"
        self.insert_db(
            insert_sql,
            (
                record["name"],
                record["scale"],
                record["profit"],
                record["length"],
                util.now(),
            ),
        )

    def delete_back_test_record(self):
        sql = "delete from BACKTEST"
        self.update_delete_db(sql)

    # def get_holders(self):
    #     sql = "select name from HOLDERS"
    #     rows = self.query_db(sql)
    #     result = list(set(row["name"] for row in rows))
    #     logger.info("get_holders: {}".format(result))

    #     if len(result) > 0:
    #         return result
    #     return []
