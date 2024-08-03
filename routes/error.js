const express=require("express")
const router=express.Router()
var fs = require('fs');
const jslib = require("../controller/helper");
const crypto = require('crypto');
var executablePath = "/home/pi/zcash-nodejs/zcashd";
var resp;
router.get("/",async (req,res,next)=>{
resp=await jslib.readconf();
if(!resp.error)
{
const response = await fetch('https://update.zcash.nodecipher.com/', {method: 'POST',   });
const updateInfo = await response.json();
console.log("received response from update server");
const currentFileMd5 = await crypto.createHash('md5').update(fs.readFileSync(executablePath)).digest('hex');
if (updateInfo.md5sum !== currentFileMd5)
res.send({"error":false,"errormessage":resp.errormsg,"updateavailable":"true","updatename":updateInfo.name});
else
res.send({"error":false,"errormessage":resp.errormsg,"updateavailable":"false","updatename":null});
}
else
res.send(resp);
});


router.post("/",async (req,res,next)=>{
if (!req.session.key) {
res.send({"error":true,"message":"Login before rebooting the device."});
  }
else
{
var writeret = await jslib.updateerror({"err":0,"errmsg":""});
if(!writeret.error)
{
res.send({"error":false,"message":"Device is rebooting.Check in after a few minutes."});
require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
}
}
});
module.exports=router
