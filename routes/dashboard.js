const express=require("express")
const router=express.Router()
const jslib = require("../controller/jsonread");
let resstr="";
var cookieParser = require('cookie-parser');
router.use(cookieParser());
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
