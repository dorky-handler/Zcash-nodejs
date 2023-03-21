const express=require("express")
const fs = require('fs')
const path = './node.conf'
var ferr=false;
var response="";
// Creating express Router
const router=express.Router()
router.use(express.json())
// Handling register request

router.get("/",(req,res,next)=>{
res.sendFile( '/home/pi/node/views/register.html');

});


router.post("/",(req,res,next)=>{
//console.log(req.body);
//res.send(req.body.password);
try {
  if (fs.existsSync(path)) {
    //file exists
console.log("file exists");
res.send("\"error\":\"true\",\"message\":\"exists\"");
  }
else
{
var conf="{\"name\":\""+req.body.name+"\",\"password\":\""+req.body.password+"\",\"conf\":\"none\",\"token\":\"\"}";
try {
  fs.writeFileSync(path,conf);
  // file written successfully
} catch (err) {
  console.error(err);
response="{\"error\":\"true\",\"message\":\""+err+"\"}";
ferr=true;
}
if(!ferr)
response = "{\"error\":\"false\",\"message\":\"registered\"}";
res.send(response);

}
} catch(err) {
  console.error(err)
}
})
module.exports=router
