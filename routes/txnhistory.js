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

var decrypted = JSON.parse(resp.decrypted);
meth="z_listreceivedbyaddress";
params=[decrypted.from];
data = {"method":meth , "params":params};
var ballist = await fetch.rpc(data);
if(ballist.error==null)
{
var resultrow = [];
for(var i=0;i<ballist.result.length;i++)
{
resultrow.push({"txid":ballist.result[i].txid,"amt":ballist.result[i].amount,"type":"Receive","tmstmp":ballist.result[i].blocktime,"memo":ballist.result[i].memoStr?ballist.result[i].memoStr:""});
}
console.log("Receive only row ");
console.log(JSON.stringify(resultrow));
var rows = await jslib.gettxn(decrypted.from);
for(var i=0;i<rows.length;i++)
{
resultrow.push({"txid":rows[i].Txid,"amt":rows[i].Amount,"type":rows[i].Type,"tmstmp":rows[i].Tmstmp,"memo":rows[i].Memo,"to":rows[i].Toadr});
}
console.log("Receive with send row ");
console.log(JSON.stringify(resultrow));
resultrow.sort((a, b) => a.tmstmp - b.tmstmp);
console.log("row sorted");
console.log(JSON.stringify(resultrow));
var sendmsg = await jslib.encryptData({"message":{"send":resultrow}}, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}
else
res.send({"error":true,"message":ballist.error});

}
}
});
module.exports=router
