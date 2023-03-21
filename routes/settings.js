const express=require("express");
const router=express.Router()
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());
const fs = require('fs')
const path = './node.conf'
const jslib = require("../controller/jsonread");
router.post("/",(req,res,next)=>{
var msg;
var resp=jslib.cookieconf(req.cookies["zcash-ui"]);
if(resp.error)
{
res.send(resp);
}
else
{
resp.blockinfo="block";
res.send(resp);
}


});


router.get("/",(req,res,next)=>{
res.sendFile( '/home/pi/node/views/settings.html');

});


module.exports=router
