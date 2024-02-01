const express=require("express")
const router=express.Router()
const jslib = require("../controller/jsonread");
let resstr="";
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.get("/",async (req,res,next)=>{
var resp=jslib.cookieconf(req.cookies["zcash-ui"]);
if(resp.error)
{
res.send(resp);
}
else
{
/*res.download(
        "/home/pi/mnt/node/debug.log", 
        "debug.log", // Remember to include file extension
        (err) => {
            if (err) {
                res.send({
                    error : err,
                    msg   : "Problem downloading the file"
                })
            }
    });*/
const debugout = await execShellCommand('tail -n 50 /home/pi/mnt/node/debug.log > /home/pi/mnt/node/debugoutput.log && echo true');
console.log(debugout);
if(debugout=="true")
{
res.sendfile(
        "/home/pi/mnt/node/debugoutput.log",
        "debug.log", // Remember to include file extension
        (err) => {
            if (err) {
                res.send({
                    error : err,
                    msg   : "Problem downloading the file"
                })
            }
    });
}
}
});
function execShellCommand(cmd) {
 const exec = require('child_process').exec;
 return new Promise((resolve, reject) => {
  exec(cmd, (error, stdout, stderr) => {
   if (error) {
    console.warn(error);
   }
   resolve(stdout? stdout : stderr);
  });
 });
}
module.exports = router;
