const express=require("express")
const router=express.Router()
const jslib = require("../controller/jsonread");
var resp;
router.get("/",(req,res,next)=>{
resp=jslib.jsread();
if(!resp.error)
res.send({"error":false,"errormessage":resp.conf.errmsg,"updateavailable":resp.conf.updateavailable,"updatename":resp.conf.updatename});
else
res.send(resp);
});


router.post("/",(req,res,next)=>{
if (!req.session.key) {
res.send({"error":true,"message":"Login before rebooting the device."});
  }
else
{
resp.conf.error=0;
resp.conf.errmsg="";
var writeret = jslib.writeconf(resp.conf);
if(!writeret.error)
{
res.send({"error":false,"message":"Device is rebooting.Check in after a few minutes."});
require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
}
}
});
module.exports=router

