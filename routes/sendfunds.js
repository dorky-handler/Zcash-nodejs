const express=require("express");
const router=express.Router()
const jslib = require("../controller/helper");
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
if(decobj.to[0]=='t')
var params =[decobj.ua,[{"address":decobj.to,"amount":decobj.amt}],1,decobj.fees,decobj.type];
else
{
const buf = Buffer.from(decobj.memo, 'utf8');
var memo = (buf.toString('hex'));
var params =[decobj.ua,[{"address":decobj.to,"amount":decobj.amt,"memo":memo}],1,decobj.fees,decobj.type];
}
var data = {"method":meth , "params":params};
var result = await fetch.rpc(data);
console.log("Send funds output - ");
console.log(result);
if(result.error==null)
{
var params =[[result.result]];
var meth="z_getoperationstatus";
var data = {"method":meth , "params":params};
var txobj = await fetch.rpc(data);
console.log("send txobj - ");
console.log(txobj);
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
