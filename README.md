# wsapp

An automatic futures trading web application.
react-eCharts is used to build the UI and use web socket to connect the backend which
implement by python web frame fastapi. The backend service will connect the account from
real futures agent.
You now can trade futures on web seamlessly instead of downloading any desktop
application. You now can write and backtest their own trade strategies and trade the futures
automatically. Any ask or bid prices will be reflected on the UI for easy reference.

1.  your account from tqsdk and futures account from your agent need to update in wsapp/server/appsrv.py

    api = TqApi(
    TqAccount("agent name", "useid", "usepassword"),
    auth=TqAuth("tqsdk_user", "tqsdk_id"),
    )

2.  rename sample.py file under wsapp/server/service/ to engine.py, which will be used for your trade strategies

In the futures page - Auto button will enable the automatic trade base on your stragegy

![Alt text](image.png)
In the Dashboard page - you can do backtest with your stragegy to see if you make some consistent profit :)

![Alt text](image-1.png)

HAVE FUN!
