const express = require('express');
const fetch = require('node-fetch');
const router=express.Router();
const crypto = require('crypto');
const jslib = require("../controller/jsonread");
router.use(express.json());
var code,sessionKey="";
var connectedClients = {};
const WebSocket = require('ws');
const path = require('path'); 
function generate6DigitCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function heartbeat() {
  clearTimeout(this.pingTimeout);
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}


const wss = new WebSocket.Server({ port: 9999 });


wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('error', console.error);
  ws.on('pong', heartbeat);
  ws.on('message', (message) => {
    var code = message;
    //ws.send(code);
    connectedClients[code] = ws;
  });
});



router.get('/', (req, res) => {
 res.sendFile(path.join(__dirname, '../views/login.html'));
});

var key;

router.post('/', async (req, res) => {
var resp = jslib.jsread();
var userName = resp.conf.name;
var pwd = resp.conf.password;
 console.log("conf = "+JSON.stringify(resp.conf));
const response = await fetch('https://login.zcash.nodecipher.com');


if(req.body.auth)
{
  console.log("Received auth req");
  if(sessionKey!="")
  {
    req.session.key=sessionKey;
    res.send({"auth":"success"});
    sessionKey="";
  }
}
else
{
  code = generate6DigitCode();
  sessionKey="";
  const ws = new WebSocket('wss://login.zcash.nodecipher.com:443');
  ws.on('error', console.error);
  ws.on('ping', heartbeat);
  ws.on('open', heartbeat);
  ws.on('open', async () => {
   ws.send(code);
   console.log("Ping and pong working");
   res.send({"code": code });
   console.log("code send code="+code);
  });

  ws.on('message', async (message) => {
    const { username, password, key } = JSON.parse(message);
    console.log("uname= "+username+" pwd = "+password);
    const isValid = username === userName && password === pwd;
    if (isValid)
    sessionKey=key;
    ws.send(JSON.stringify({ "auth":isValid}));
    var client = connectedClients[code];
    if (client&&client.readyState != WebSocket.CLOSED)
    {
      client.send(JSON.stringify({ "auth":isValid }));
      client.terminate();
      delete connectedClients[code];
    }
    //ws.send(JSON.stringify({ "auth":isValid , "code":key })); // Send response back to remote server
    console.log("isvalid = "+isValid);
    ws.terminate(); // Close connection
  });

ws.on('close', function clear() {
  clearTimeout(this.pingTimeout);
});
}
});
module.exports=router
