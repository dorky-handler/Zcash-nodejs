const express=require("express");
const router=express.Router()
const jslib = require("../controller/jsonread");
const path = require('path');
var cookieParser = require('cookie-parser');
const fetch = require("../controller/fetch");
router.use(cookieParser());
router.use(express.json());

router.get("/",(req,res,next)=>{
if (!req.session.key) {
res.redirect("/login");
  }
else
res.sendFile( path.join(__dirname, '../views/wallet.html'));

});

router.post("/",async (req,res,next)=>{
var addresslist = [];
var key = req.session.key;
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
var meth="z_listaccounts";
var params =[];
var data = {"method":meth , "params":params};
var accountlist = await fetch.rpc(data);
if(accountlist.error==null)
{
var sendmsg = await jslib.encryptData(accountlist, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}
else
res.send({"error":true,"message":accountlist.error});
//res.send(accountlist);
}
}
});
module.exports=router
