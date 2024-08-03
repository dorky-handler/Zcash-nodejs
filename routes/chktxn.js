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
var opid = decobj.opid;
var params =[[opid]];
var meth="z_getoperationstatus";
var data = {"method":meth , "params":params};
var txobj = await fetch.rpc(data);
console.log("checktxn operstatus result- ");
console.log(txobj.result);
if (txobj.error!=null)
{
var ret = {"error":true , "message":txobj.error};
res.send(ret);
}
else if(txobj.result.length === 0)
{
var ret = {"error":true , "message":"Invalid Operation ID"};
res.send(ret);
}
else
{
if(txobj.result[0].status==="success")
{
var ttype = decobj.type;
var obj = {"fromadr":decobj.fromadr, "txid":txobj.result[0].result.txid, "amt":decobj.amt, "type":ttype};
var rl = await jslib.newtxn(obj);
var ret = {"message":"success","txid":txobj.result[0].result.txid};
var sendmsg = await jslib.encryptData(ret, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}
else if(txobj.result[0].status==="failed")
{
var ret = {"error":true , "message":txobj.result[0].error.message};
res.send(ret);
}
else
{
if(txobj.result[0].status!=="executing")
console.log(txobj.result[0].result);
var ret = {"message":txobj.result[0].status};
var sendmsg = await jslib.encryptData(ret, key);
if(sendmsg.error)
res.send(sendmsg);
else
res.send({"error":false,"result":sendmsg});
}

}
}
}
});

module.exports=router
