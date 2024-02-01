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

router.post("/", async (req,res,next)=>{

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
fs.exists(bkpath,async function(exists) {
if(exists)
await fs.unlinkSync(bkpath);
});
var meth="z_exportwallet";
var params =["walletbackup"];
var data = {"method":meth , "params":params};
var wtrq = await fetch.rpc(data);
if(wtrq.error==null)
{
//res.download(wtrq.result,"walletbackup");
var data = await fs.readFileSync(wtrq.result, 'utf-8');
console.log(data);
var sendmsg = await jslib.encryptData(data, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});

}
else
res.send({"error":true,"message":wtrq.error.message});

}
}
});

module.exports=router
