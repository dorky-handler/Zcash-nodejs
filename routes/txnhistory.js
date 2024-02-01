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
var meth="z_getoperationstatus";
var params =[];
var data = {"method":meth , "params":params};
var oplist = await fetch.rpc(data);
if(oplist.error==null)
{
var decrypted = JSON.parse(resp.decrypted);
meth="z_listreceivedbyaddress";
params=[decrypted.from];
data = {"method":meth , "params":params};
var ballist = await fetch.rpc(data);
if(ballist.error==null)
{
//res.send({"error":false,"message":{"send":oplist.result,"receive":ballist.result}});
var sendmsg = await jslib.encryptData({"message":{"send":oplist.result,"receive":ballist.result}}, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}
else
res.send({"error":true,"message":ballist.error});
}
else
res.send({"error":true,"message":oplist.error});
}
}
});
module.exports=router



