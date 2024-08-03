const express=require("express")
const router=express.Router()
const jslib = require("../controller/helper");
const path = require('path');
const dbPath = 'db/node.db'
const fs = require('fs');
router.use(express.static('./public'));






router.get("/",async (req,res,next)=>{
var resp=await jslib.readconf();
if (fs.existsSync(dbPath)) 
{
console.log(req.session.key);
if (!req.session.key) {
res.redirect("/login");
  }
else if(resp.err>=3)
{
res.sendFile( path.join(__dirname, '../views/error.html'));
}
 else {
res.sendFile( path.join(__dirname, '../views/index.html'));
  }
}
else
{
res.redirect("/register");
}

});

module.exports=router
