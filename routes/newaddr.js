const express=require("express");
const router=express.Router()
const jslib = require("../controller/helper");
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
res.redirect("/login");
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
  if(exists) {
      console.log('File exists. ');
  } else {
console.log('File not found, so creating.');
var meth="z_exportwallet";
var params =["walletbackup"];
var data = {"method":meth , "params":params};
var wtrq = await fetch.rpc(data);
if(!wtrq.error==null)
res.send({"error":"true","message":wtrq.error.message});
else
{
var readdata = await fs.readFileSync(wtrq.result, 'utf-8');
readdata = readdata.toString();
readdata = readdata.split('\n');
var seedstr = readdata[5].split('"');
var meth="walletconfirmbackup";
var params =[seedstr[1]];
var data = {"method":meth , "params":params};
var confirmbkp = await fetch.rpc(data);
if(!confirmbkp.error==null)
res.send({"error":"true","message":confirmbkp.error.message});
}
}
});
var meth="z_getnewaccount";
var params =[];
var data = {"method":meth , "params":params};
var newaccount = await fetch.rpc(data);
if(newaccount.result==null)
res.send({"error":true,"message":newaccount.error.message});
else{
console.log("newacc=");
console.log(newaccount);
meth="z_getaddressforaccount";
params =[newaccount.result.account];
var data = {"method":meth , "params":params};
var uniaddr = await fetch.rpc(data); 
console.log(uniaddr);
if(!uniaddr.error==null)
res.send({"error":true,"message":uniaddr.error.message});
else{
meth="z_listunifiedreceivers";
params =[uniaddr.result.address];
data = {"method":meth , "params":params};
var address =  await fetch.rpc(data); 
if(address.error==null)
{
var sendmsg = await jslib.encryptData({"message":"New address successfully added"}, key);
if(sendmsg.error)
res.send(sendmsg);
else
{
var respmsg = { "error":false , "message":sendmsg};
res.send(respmsg);
}
}
else
{
res.send({"error":true,"message":address.error.message});
}
}
}
}
}
});


module.exports=router
