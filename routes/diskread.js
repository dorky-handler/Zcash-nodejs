const express=require("express");
const router=express.Router()
const jslib = require("../controller/helper");
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(express.json());
var blk = require('linux-blockutils');
router.get("/",async (req,res,next)=>{
var msg="mbn";


await blk.getBlockInfo({}, function(err,json) {
  if (err) {
    console.log("ERROR:" + err);
  } else {
var diskarray=[];
   for(var i=0;i<json.length;i++)
{
if(json[i].SIZE>10737418240&& json[i].PARTITIONS.length === 0)
diskarray.push(json[i]);
if(json[i].TYPE==='disk')
{
const result = json[i].PARTITIONS.filter(chksize);
diskarray = diskarray.concat(result);
function chksize(obj) {
  return obj.SIZE >= 1073741824;
}
}
}
}
res.send(diskarray);
});

});
module.exports=router
