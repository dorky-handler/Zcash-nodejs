const express=require("express")
const router=express.Router()
const jslib = require("../controller/jsonread");
const os = require('os');
const fetch = require("../controller/fetch");
let resstr="";
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.get("/",async (req,res,next)=>{
var msg;
var resp=jslib.cookieconf(req.cookies["zcash-ui"]);
var resp1=jslib.jsread();
//console.log(resp1);
if(!req.session.key)
{
res.redirect('/login');
}
else
{
var meth="getblockchaininfo";
var params =[];
var data = {"method":meth , "params":params};
var block = await fetch.rpc(data);
meth = "getinfo";
data.method = meth;
var info = await fetch.rpc(data);
meth = "getnettotals";
data.method = meth;
var totals = await fetch.rpc(data);
var response = {error:false };
var uptime="";
let ut_sec = os.uptime();

let ut_min = ut_sec / 60;
let ut_hour = ut_min / 60;
let ut_day =  ut_hour / 24;

ut_sec = Math.floor(ut_sec);
ut_min = Math.floor(ut_min);
ut_hour = Math.floor(ut_hour);
ut_day = Math.floor(ut_day);

if(ut_day!=0)
uptime = ut_day + " days";
else if(ut_hour!=0)
uptime = ut_hour +" hours";
else if (ut_min!=0)
uptime = ut_min + " minutes";
else
uptime = ut_sec + " seconds";

if(block.id=="zcashnode"&&block.error==null&&info.id=="zcashnode"&&info.error==null&&totals.id=="zcashnode"&&totals.error==null)
{
response.error=false;
//response.message=block;
response.dco = block.result.initial_block_download_complete;
response.diff = block.result.difficulty/1024;
response.height = block.result.blocks;
response.sizeondisk = block.result.size_on_disk/1000000000;
response.chain =block.result.chain;
response.valuepools = block.result.valuePools;
response.client = info.result.subversion;
response.version = info.result.version;
response.connections = info.result.connections;
response.upload = totals.result.totalbytessent/(1024*1024);
response.download = totals.result.totalbytesrecv/(1024*1024);
response.trueheight = block.result.estimatedheight;
response.os=os.arch();
response.freemem = os.freemem();
response.totalmem = os.totalmem();
response.uptime = uptime;
if("updateavailable" in resp1.conf)
response.updateavailable = resp1.conf.updateavailable;
if("updatename" in resp1.conf)
response.updatename = resp1.conf.updatename;
//response.totals = totals.result;
res.send(response);
}
else
{
response.error=true;
if(block.error!=null)
response.message=(block.error.message);
if(info.error!=null)
response.message=(info.error.message);
if(totals.error!=null)
response.message=(totals.error.message);
res.send(response);
}
}
/*if(resp['error'])
{
msg={
error:true,
redirect:"register"
}
    res.send(msg);
}

else if(jsonobj.conf.token=="none"||req.cookies["zcash-ui"]!=jsonobj.conf.token)
{
 msg={
error:true,
redirect:"login"
}
res.send(msg);
}
else
{
var obj = jsonobj.conf;
if(obj=="none")
{
msg={
error:false,
redirect:"config"
}
res.send(msg);
}
else
{

msg=
{
error:false,
redirect:"none",
blockinfo:"info"
}
 res.send(msg);
}
}
*/
});
module.exports=router
