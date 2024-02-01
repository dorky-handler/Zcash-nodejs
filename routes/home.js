const express=require("express")
const router=express.Router()
const jslib = require("../controller/jsonread");
const path = require('path');
router.use(express.static('./public'));






router.get("/",(req,res,next)=>{
//res.sendFile( path.join(__dirname, '../views/index.html'));
var resp=jslib.jsread();
if(!resp.error)
{
if (!req.session.key) {
res.redirect("/login");
  }
else if(resp.conf.error>=3)
{
res.sendFile( path.join(__dirname, '../views/error.html'));

}
 else {
res.sendFile( path.join(__dirname, '../views/index.html'));
 //res.send('Please log in.');
  }
}
else
{
res.redirect("/register");
}

});

module.exports=router
