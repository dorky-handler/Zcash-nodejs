const express=require("express")
const fs = require('fs')
const { exec } = require('child_process');
const path = 'db/node.db'
const spath = './zcash.conf'
const path1 = require('path');
var ferr=false;
var response="";
const jslib = require("../controller/helper");
const router=express.Router()
router.use(express.json())

router.get("/",(req,res,next)=>{
 if (fs.existsSync(path)) {
console.log("file exists");
 res.redirect('/login');
}
else
res.sendFile( path1.join(__dirname, '../views/create.html'));
});


router.post("/",async(req,res,next)=>{
try {
  if (fs.existsSync(path)) {
console.log("file exists");
res.send({"error":true,"message":"exists"});
  }
else
{
 if (!req.body.password || req.body.password.trim() === ''||!req.body.name || req.body.name.trim() === '') {
      res.status(400).json({ error: true,message:'Username&Password is required' });
      return;
    }
else
{

var conf={"name":req.body.name,"password":req.body.password,"drive":req.body.drv};
var fret = jslib.create(conf);
await fs.writeFileSync(spath, "", { flag: 'wx' }, function (err) {
    if (err) throw err;
    console.log("It's saved!");
});
if(fret.err)
{
response = {"error":true,"message":fret.message};
res.send(response);
console.log("encountered error");
}
else
{
response = {"error":false,"message":"registered"};
try {
    await new Promise((resolve, reject) => {
      exec(`sudo useradd -m -p '' ${req.body.name} && echo "${req.body.name}:${req.body.password}" | sudo chpasswd && sudo usermod -aG sudo ${req.body.name}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          console.error(stderr);
        } else {
          resolve();
        }
      });
    });
	res.send(response);
require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
  } catch (error) {
    console.error(`Error creating user: ${error}`);
response = {"error":true,"message":error};
 if (fs.existsSync(path))
fs.unlinkSync(path);
 if (fs.existsSync(spath))
fs.unlinkSync(spath);
res.send(response);
  }
}
}
}
} catch(err) {
response = {"error":true,"message":err};
res.send(response);
  console.error(err)
}
})
module.exports=router
