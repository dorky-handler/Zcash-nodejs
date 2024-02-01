const express=require("express");
const router=express.Router()
const jslib = require("../controller/jsonread");
const path = require('path');
var fs = require('fs');
var bkpath=path.join(__dirname, "../../mnt/node/walletbackup");
var cookieParser = require('cookie-parser');
const fetch = require("../controller/fetch");
router.use(cookieParser());
router.use(express.json());

router.post("/",async (req,res,next)=>{

var addresslist = [];
var key = req.session.key
if (!req.session.key) {
res.send({"error":true, "message":"Login to continue"});
  }
else
{
var resp = await jslib.decryptObj(req.body.encryptedData, req.body.iv, req.body.salt,key);
if(resp.error)
{
res.send(resp);
}
else
{
var decobj = JSON.parse(resp.decrypted);
var meth="z_listunifiedreceivers";
var params =[decobj.ua];
var data = {"method":meth , "params":params};
var accountlist = await fetch.rpc(data);
if(accountlist.error==null)
//res.send({"error":"false","message":accountlist});
{
var sendmsg = await jslib.encryptData(accountlist, key);
if(sendmsg.error)
res.send(sendmsg);
else
{
var respmsg = { "error":false , "message":sendmsg};
res.send(respmsg);
}
}
else
res.send({"error":true,"message":accountlist.error});
//res.send(accountlist);
}
}
});
module.exports=router
