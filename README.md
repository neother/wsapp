# wsapp

An automatic futures trading web application.

React-eCharts is used to build the UI and use web socket to connect the backend which
implement by python web frame fastapi. 

Features:
1. Futures can be traded on web seamlessly instead of downloading any desktop application
2. Trading strategies can be written and backtested.
3. Auto trading can be enabled/disabled.
4. Support mannual trading.
5. Any ask or bid prices will be reflected on the UI for easy reference.

How to use:
1.  your account from tqsdk and futures account from your agent need to update in wsapp/server/appsrv.py

    api = TqApi(
    TqAccount("agent name", "useid", "usepassword"),
    auth=TqAuth("tqsdk_user", "tqsdk_id"),
    )

2.  rename sample.py file under wsapp/server/service/ to engine.py, which will be used for your trade strategies

Screenshots:
In the futures page - Auto button will enable the automatic trade base on your stragegy

![Alt text](image.png)
In the Dashboard page - you can do backtest with your stragegy to see if you make some consistent profit :)

![Alt text](image-1.png)

HAVE FUN!
