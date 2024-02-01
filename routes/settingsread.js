const express=require("express");
const router=express.Router()
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());
const path = './node.conf'
const jslib = require("../controller/jsonread");

router.get("/",async (req,res,next)=>{
var msg;
var resp = jslib.jsread();
//console.log("Settings read=");
//console.log(resp);
//var data = JSON.parse(resp.msg);
msg = {"error":false , message:resp.conf.settings};
res.send(msg);
});
module.exports=router
