const express=require("express");
const router=express.Router()
const jslib = require("../controller/helper");
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
var meth="z_mergetoaddress";
var decrypted = JSON.parse(resp.decrypted);
var params =[[decrypted.from],decrypted.orchard,null,0,0,"","AllowRevealedSenders"];
var data = {"method":meth , "params":params};
var accountlist = await fetch.rpc(data);
console.log("Shield funds output - ");
console.log(accountlist);

if(accountlist.error==null)
{
var params =[[accountlist.result.opid]];
var meth="z_getoperationstatus";
var data = {"method":meth , "params":params};
var txobj = await fetch.rpc(data);
console.log("shield txobj - ");
console.log(txobj);
var sendmsg = await jslib.encryptData(accountlist, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}
else
res.send({"error":true,"message":accountlist.error});
}
}
});
module.exports=router
