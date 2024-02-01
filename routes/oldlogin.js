const express=require("express")
const cookieParser = require('cookie-parser')
const fs = require('fs')
const path = './node.conf'
const path1 = require('path');
const router=express.Router();
var crypto = require("crypto");
const jslib = require("../controller/jsonread");
let resstr="";
var ferr=false;
var onemonth = 30 * 24 * 3600 * 1000;
router.use(cookieParser());
router.use(express.json());


router.get("/",(req,res,next)=>{
res.sendFile( path1.join(__dirname, '../views/login.html'));
});


router.post("/",(req,res,next)=>{
var msg;
var resp=jslib.jsread();
var jsonobj=resp;
//res.send(req.body);
if(resp['error'])
{
msg=
{
error:true,
redirect:"register"
};
res.send(msg);
}
else
{
if(resp.conf.name==req.body.name&&resp.conf.password==req.body.password)
{
var id = crypto.randomBytes(10).toString('hex');
resp.conf.token=id;
var fret = jslib.writeconf(resp.conf);
if(!fret.err)
{
res.cookie(`zcash-ui`,id,{
        maxAge: onemonth,
        httpOnly: true,
         });
	msg={
error:false,
redirect:"dashboard"
}
}
else
{
msg={error:true,redirect:"none",message:fret.message};
}
res.send(msg);
}
else
{
msg=
{
error:true,
redirect:"none",
message:"Incorrect username/password"
}
res.send(msg);
}
}



});
module.exports=router
