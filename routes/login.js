const express = require('express');
const fetch = require('node-fetch');
const dbPath =  'db/node.db';
const fs = require('fs');
const router=express.Router();
const crypto = require('crypto');
const jslib = require("../controller/helper");
router.use(express.json());
var code,sessionKey="";
var connectedClients = {};
const WebSocket = require('ws');
const path = require('path');



function heartbeat() {
  clearTimeout(this.pingTimeout);
  this.pingTimeout = setTimeout(() => {
    this.terminate();
  }, 30000 + 1000);
}

async function WssSetup()
{
var rl = await jslib.getRemotelogin();
if(rl.remotelogin!="false")
{
const wss = new WebSocket.Server({ port: 9999 });


wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('error', console.error);
  ws.on('pong', heartbeat);
  ws.on('message', (message) => {
    var code = message;
    connectedClients[code] = ws;
  });
});
}
}

WssSetup();



router.get('/', async (req, res) => {
if(fs.existsSync(dbPath)){
var rl = await jslib.getRemotelogin();
if(rl.remotelogin!="false")
res.sendFile(path.join(__dirname, '../views/login.html'));
else
res.sendFile(path.join(__dirname, '../views/locallogin.html'));
}
else
res.sendFile(path.join(__dirname, '../views/create.html'));
});

var key;

router.post('/', async (req, res) => {
var rl = await jslib.getRemotelogin();
if(rl.remotelogin!="false")
{
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
  code = jslib.generate6DigitCode();
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
    var isValid = await jslib.isValid(username,password);
    if (isValid)
    sessionKey=key;
    else
    console.log("Not valid");
    ws.send(JSON.stringify({ "auth":isValid}));
    var client = connectedClients[code];
    if (client&&client.readyState != WebSocket.CLOSED)
    {
      client.send(JSON.stringify({ "auth":isValid }));
      client.terminate();
      delete connectedClients[code];
    }
    ws.terminate(); 
  });

ws.on('close', function clear() {
  clearTimeout(this.pingTimeout);
});
}
}
else
{
var userName = req.body.username;
var pwd = req.body.password;
var isValid = await jslib.isValid(userName,pwd);
var key =await jslib.generate8DigitCode();
if(isValid)
{
req.session.key=key;
res.send({"error":false,"key":key});
}
else
res.send({"error":true,"message":"Username/Password does not match"});
}
});
module.exports=router
