const express=require("express")
  
// Creating express Router
const router=express.Router()
  
// Handling login request
router.post("/",(req,res,next)=>{
    res.send("This is the wallet request")
})
module.exports=router
