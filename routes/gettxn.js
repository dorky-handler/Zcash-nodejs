const express=require("express")
const router=express.Router()
const fetch = require("../controller/fetch");
const jslib = require("../controller/helper");
router.use(express.json());


router.post("/",async (req,res,next)=>{
var key = req.session.key
if (!req.session.key) {
res.send({"error":true, "message":"Login to continue"});
}
else {
var resp = await jslib.decryptObj(req.body.encryptedData, req.body.iv, req.body.salt,key);
if(resp.error)
{
res.send(resp);
}
else
{
var decobj = JSON.parse(resp.decrypted);
var txid = decobj.txid;
var params =[txid];
var meth="gettransaction";
var data = {"method":meth , "params":params};
var txobj = await fetch.rpc(data);
console.log("gettxn operstatus result- ");
console.log(txobj.result);
if (txobj.error!=null)
{
var ret = {"error":true , "message":txobj.error};
res.send(ret);
}
else
{
console.log("Block hash - ");
console.log(txobj.result.blockhash);
console.log("Status - ");
console.log(txobj.result.status);
console.log("confirmations - ");
console.log(txobj.result.confirmations);
console.log("amount - ");
console.log(txobj.result.amount);
console.log("timestamp - ");
console.log(txobj.result.time);
var params =[txobj.result.blockhash];
var meth="getblock";
var data = {"method":meth , "params":params};
var blockobj = await fetch.rpc(data);
if(blockobj.error==null)
{
var ret = {"message":{"height":blockobj.result.height,"confirmations":txobj.result.confirmations,"amount":txobj.result.amount,"status":txobj.result.status,"timestamp":txobj.result.time}};
var sendmsg = await jslib.encryptData(ret, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}
else
{
res.send({"error":true,"result":blockobj.error});
}

}
}
}
});

module.exports=router
