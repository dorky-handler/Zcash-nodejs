const express=require("express");
const router=express.Router()
const jslib = require("../controller/jsonread");
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
var decobj = JSON.parse(resp.decrypted);
var meth="z_sendmany";
console.log(decobj);
var params =[decobj.ua,[{"address":decobj.to,"amount":decobj.amt}],1,decobj.fees,decobj.type];
var data = {"method":meth , "params":params};
var result = await fetch.rpc(data);
if(result.error==null)
{
var sendmsg = await jslib.encryptData(result, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}
else
res.send({"error":true,"message":result.error});
}
}
});
module.exports=router
