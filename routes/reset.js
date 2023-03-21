const express=require("express")
const fs = require('fs')
const path = './node.conf'
const jslib = require("../controller/jsonread");
let resstr="";
var cookieParser = require('cookie-parser');
var response="";
const router=express.Router();
router.use(cookieParser());
router.use(express.json());
router.get("/",(req,res,next)=>{
res.sendFile( '/home/pi/node/views/reset.html');
});
router.post("/", (req,res,next)=>{
var msg;
var resp=jslib.cookieconf(req.cookies["zcash-ui"]);
if(resp.error)
{
res.send(resp);
}
else
{
try {
  if (!fs.existsSync(path))
{
console.log("file does not exist");
res.send("\"error\":\"true\",\"message\":\"nofile\",\"redirect\":\"register\"");
  }
else
{
var msg;
var resp=jslib.jsread();
resp.conf.password=req.body.password;
fs.writeFileSync(path,JSON.stringify(resp.conf));
res.clearCookie("zcash-ui");
msg={
error:false,
redirect:"login"
}
res.send(msg);
}
}
catch(err)
{
msg={
error:true,
redirect:"none",
message:err
}
res.send(msg);
}
}
});

module.exports=router
