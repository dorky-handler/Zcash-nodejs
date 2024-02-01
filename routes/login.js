const express = require('express');
const fetch = require('node-fetch');
const router=express.Router();
const crypto = require('crypto');
const jslib = require("../controller/jsonread");
router.use(express.json());
const WebSocket = require('ws');
const path = require('path'); // Added for serving static files

//const obj = { username: 'ahas', password: 'password' }; // Object for validation

// Generate a 6-digit code
function generate6DigitCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generate8DigitCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}




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

if(req.body.key==key)
{
req.session.key=key;
res.send({"auth":true});
}
else
res.send({"auth":false});
}
else
{
  const code = generate6DigitCode();
  var status=false;
  const ws = new WebSocket('wss://login.zcash.nodecipher.com:443'); 

  ws.on('open', async () => {
    ws.send(code);
   status=true;
   res.send({"code": code,"status":status });
   console.log("code send code="+code);
  });

  ws.on('message', async (message) => {
    const { username, password } = JSON.parse(message);
    console.log("uname= "+username+" pwd = "+password);
    key=generate8DigitCode()+generate8DigitCode();
    const isValid = username === userName && password === pwd; // Perform validation
    ws.send(JSON.stringify({ "auth":isValid , "code":key })); // Send response back to remote server
    console.log("isvalid = "+isValid);
    ws.terminate(); // Close connection
  });
}
});
module.exports=router
