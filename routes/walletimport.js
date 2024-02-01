const express=require("express");
const router=express.Router()
const jslib = require("../controller/jsonread");
const path = require('path');
var fs = require('fs');
var bkpath=path.join(__dirname, "../../mnt/node/walletimport");
var cookieParser = require('cookie-parser');
const fetch = require("../controller/fetch");
router.use(cookieParser());
router.use(express.json());
router.post("/", async (req,res,next)=>{

var resp=jslib.cookieconf(req.cookies["zcash-ui"]);
if(resp.error)
{
res.send(resp);
}
else
{
if(req.body.input!=null)
{
var lines = req.body.input.split(/\r?\n/);
if(lines[lines.length-2]==="# End of dump")
{
await fs.exists(bkpath,async function(exists) {

  if(exists) {

      console.log('File exists. ');

     await fs.unlinkSync(bkpath);

  }
});
await fs.writeFileSync(bkpath, req.body.input);
var meth="z_importwallet";
var params =[bkpath];
var data = {"method":meth , "params":params};
var wtrq = await fetch.rpc(data);
console.log(wtrq);
if(wtrq.error==null)
res.send({"error":"false","message":"Wallet succesfully imported"});
else
res.send({"error":"true","message":wtrq.error.message});
}
else
{
res.send({"error":"true","message":"Wrong wallet backup format"});
}
}
else
res.send({"error":"true","message":"No input file"});
}
});

module.exports=router
