var express = require('express');
var app = express();
const { exec } = require("child_process");
const homeroute=require("./routes/home.js")
const dashroute=require("./routes/dashboard.js")
const loginroute=require("./routes/login.js")
const notifroute=require("./routes/notification.js")
const settingsroute=require("./routes/settings.js")
const resetroute=require("./routes/reset.js")
const walletroute=require("./routes/wallet.js")
const regroute=require("./routes/register.js")
//const profileroute=require("./routes/profile.js")

/*
const ls=exec("/home/pi/node/run.sh");

ls.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
});

ls.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});

ls.on('error', (error) => {
    console.log(`error: ${error.message}`);
});

ls.on("close", code => {
    console.log(`child process exited with code ${code}`);
});


*/

app.use("/",homeroute)
app.use("/login",loginroute)
app.use("/settings",settingsroute)
app.use("/reset",resetroute)
app.use("/wallet",walletroute)
app.use("/register",regroute)
app.use("/notifications",notifroute)
app.use("/dashboard",dashroute)


app.listen((3000),()=>{
    console.log("Server is Running")
})
