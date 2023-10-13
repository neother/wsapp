class WebSocketClass {
  constructor() {
    this.instance = null;
    // this.connect();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketClass();
    }
    return this.instance;
  }

  connect() {
    this.ws = new WebSocket("ws://127.0.0.1:4001/records");
    return this.ws
    // this.ws.onopen = (e) => {
    //   this.status = 'open';
    //   console.log(`连接成功`, e);
    // };
  }

  getMessage() {
    this.ws.onmessage = (e) => {
      console.log(e.data);
      return e.data;
    }; 
  }

  // close() {
  //   this.ws.send('close');
  //   this.ws.close();
  //   console.log('close');
  // }
}

export default new WebSocketClass();