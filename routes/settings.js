const express=require("express");
const router=express.Router();
const drivelist = require('drivelist');
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());
var conf="";
var errbool=false;
var errmsg="";
const path = './node.conf'
const path1 = require('path');
const jslib = require("../controller/jsonread");
const fetch = require("../controller/fetch");


router.post("/",async (req,res,next)=>{
var msg;
console.log(req.session.key);
console.log("typeof = ");
console.log(typeof(req.session.key));
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
//code for settings req;
console.log("decrypted fan = "+resp.decrypted.fan+" type of dec = "+typeof(resp.decrypted));
var decobj = JSON.parse(resp.decrypted);
var fan= decobj.fan;
var update= decobj.update;
var tor= decobj.tor;
var addnode= decobj.add;
console.log("addnode = "+addnode+" typeof = "+typeof(addnode));
var bannode= decobj.ban;
var drv =  decobj.drv;
var writedata = JSON.parse(resp.msg);
var settings = {};
//const drives = await drivelist.list();
//console.log(JSON.stringify(drives));
if(fan)
settings.fan="true";
if (Array.isArray(bannode) && bannode.length) {
    settings.ban=bannode;
}
if (Array.isArray(addnode) && addnode.length) {
    settings.add=addnode;
}
if(update)
settings.update="true";
if(tor)
{
settings.tor="true";
conf+="proxy=127.0.0.1:9050 \n";
}
if(drv!=""||drv!=null)
settings.drv=drv;

if(addnode.length!=0)
{
for(var i=0; i<addnode.length; i++)
{
conf+="addnode="+addnode[i]+"\n";
}

}
var meth="clearbanned";
var params =[];
var data = {"method":meth , "params":params};
var retvarfet = await fetch.rpc(data);
console.log("fetch = ");
console.log(retvarfet);
var retobj = retvarfet;
if(retobj.id=="zcashnode"&&retobj.error==null)
{
if(bannode.length!=0)
{
//console.log("mememem");
for(var i=0;i<bannode.length;i++)
 {
  data.method="setban";
  var newparams = [];
  newparams.push(bannode[i]);
  newparams.push("add");
  newparams.push(9999999999);
  newparams.push(true);
  data.params=newparams;
  retvarfet = await fetch.rpc(data);
  console.log("fetch = ");
//  console.log(retvarfet);
  retobj = retvarfet;
//  retobj = JSON.parse(retvarfet);
  if(retobj.error!=null)
  {
        console.log(retobj.error);
	errbool=true;
	errmsg = retobj.error;
	break;
  } 
}

}


}
console.log("\n response = ");
writedata.settings = settings;
//writedata.conf = conf;
console.log(JSON.stringify(writedata));
var writesettings = {};
writesettings.node = writedata;
writesettings.conf = conf;
if(!errbool)
{
var writeret = jslib.writeset(writesettings);
if(!writeret.error)
{
var respstring = "Settings saved successfully";
var sendmsg = await jslib.encryptData(respstring, key);
if(sendmsg.error)
res.send(sendmsg);
else
{
var respmsg = { "error":false , "message":sendmsg};
res.send(respmsg);
//require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) });
}
}
else
{
var respmsg = {"error":true , "message":writeret.error};
res.send(respmsg);
}
}
else
{
errbool=false;
var respmsg = {"error":true , "message":errmsg};
res.send(respmsg);
}

}

}
});


router.get("/",(req,res,next)=>{
if (!req.session.key) {
res.redirect("/login");
  }
else
res.sendFile( path1.join(__dirname, '../views/settings.html'));
});


module.exports=router
