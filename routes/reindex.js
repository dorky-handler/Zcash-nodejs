const express=require("express")
const router=express.Router()
const jslib = require("../controller/jsonread");
const path = require('path');
router.use(express.static('./public'));
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
//console.log("resp=");
//console.log(resp);
var result = JSON.parse(resp.msg);
result.settings.reindex="true";
var writeret = jslib.writeconf(result);
if (!writeret.error)
{
var sendmsg = await jslib.encryptData("Reindex will start after reboot. Check in after a few minutes", key);
if(sendmsg.error)
res.send(sendmsg);
else
{
var respmsg = { "error":false , "message":sendmsg};
res.send(respmsg);
require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
}
}
else
res.send({"error":true,"message":writeret.error});
}
}
});

module.exports=router
