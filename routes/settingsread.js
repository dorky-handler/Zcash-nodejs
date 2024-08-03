const express=require("express");
const router=express.Router()
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());
const path = './node.conf'
const jslib = require("../controller/helper");

router.get("/",async (req,res,next)=>{
var msg;
var resp = await jslib.getsettings();
msg = {"error":false , message:resp.settings};
res.send(msg);
});
module.exports=router
