const express=require("express");
const fs = require('fs');
const path = 'db/node.db';
const spath = './zcash.conf';
const jslib = require("../controller/helper");
let resstr="";
var response="";
const router=express.Router();
router.use(express.json());

router.post("/", async (req,res,next)=>{
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
try {
if (await fs.existsSync(path)&& await fs.existsSync(spath))
{
var conf = await jslib.readconf();
console.log(conf.username);
var cmd = ("sudo userdel "+conf.username+" && sudo groupdel "+conf.username);
console.log("cmd = "+cmd);
await require('child_process').exec(cmd, function (msg) { console.log(msg); });
await fs.unlinkSync(path);
await fs.unlinkSync(spath);
var sendmsg = await jslib.encryptData("Device will be reset and reboot. Check in after a few minutes", key);
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
res.send({ "error":true , "message":"Config files does not exist."});
}
catch(error)
{
res.send({ "error":true , "message":error});
}
}
}
});

module.exports=router
