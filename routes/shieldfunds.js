const express=require("express");
const router=express.Router()
const jslib = require("../controller/jsonread");
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
//console.log("Decrypted response - " + typeof(resp.decrypted)+" "+(resp.decrypted));
var decrypted = JSON.parse(resp.decrypted);
var params =[[decrypted.from],decrypted.orchard,null,0,0,"","AllowRevealedSenders"];
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
