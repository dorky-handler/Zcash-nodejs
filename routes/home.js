const express=require("express")
const router=express.Router()

router.use(express.static('/home/pi/node/public'));






router.get("/",(req,res,next)=>{
res.sendFile( '/home/pi/node/views/index.html');

});

module.exports=router
