var express = require('express');
var app = express();
var mountutil = require('linux-mountutils');
var fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const jslib = require("./controller/helper");
var mountdir="/home/pi/mnt";
var datadir="/home/pi/mnt/node";
var executablePath = "/home/pi/zcash-nodejs/zcashd";
var logfile=datadir+"/debug.log";
const session = require('express-session');
var rpio = require('rpio');
var pin = 18;





rpio.init({mapping: 'gpio'});
rpio.open(pin, rpio.OUTPUT, rpio.LOW);
app.use(session({
  secret:  jslib.generate8DigitCode(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: null,
    secure: false,
  },
}));



function error_blink()
{
setInterval(function () {
if(rpio.read(18))
rpio.write(pin, rpio.LOW);
else
rpio.write(pin, rpio.HIGH);
}, 500);
}


function update_blink()
{
var intid= setInterval(function () {
if(rpio.read(18))
rpio.write(pin, rpio.LOW);
else
rpio.write(pin, rpio.HIGH);
}, 50);
return intid;
}


const { exec } = require("child_process");
const { spawn } = require("child_process");
const homeroute=require("./routes/home.js")
const dashroute=require("./routes/dashboard.js")
const loginroute=require("./routes/login.js")
const settingsroute=require("./routes/settings.js")
const resetroute=require("./routes/reset.js")
const rescanroute = require("./routes/rescan.js");
const reindexroute = require("./routes/reindex.js");
const regroute=require("./routes/register.js")
const wallroute = require("./routes/wallet.js")
const newaddr = require("./routes/newaddr.js")
const settread = require("./routes/settingsread.js")
const diskread = require("./routes/diskread.js")
const wallexport = require("./routes/walletexport.js")
const balroute = require("./routes/balance.js")
const addresslist = require("./routes/addresslist.js")
const txnhistory = require("./routes/txnhistory.js")
const shieldroute = require("./routes/shieldfunds.js")
const sendroute = require("./routes/sendfunds.js")
const errorroute = require("./routes/error.js")
const updateroute = require("./routes/update.js");
const chktxnroute = require("./routes/chktxn.js");
const gettxnroute = require("./routes/gettxn.js");
var resp={};
async function readconf()
{
resp=await jslib.readconf();
console.log(resp);
mountexec();
}

readconf();

//console.log(resp.error);
async function mountexec()
{
var child;
console.log("mountexec resp");
console.log(resp);
if(!resp.error)
{
console.log(resp.drv);
    var drive = resp.drv;
    if(drive)
    {
var confdir=__dirname+"/zcash.conf";
console.log(`./zcashd --datadir=${datadir} --exportdir=${datadir} --conf=${confdir}`);
var err = resp.err;

mountutil.mount("/dev/"+drive,mountdir, { "createDir": true }, async function(result) {
    if (result.error) {
      // Something went wrong!
      console.log(result.error);
      if(err<3)
        {
	var wrtobj = {};
      wrtobj.err=err+1;
     wrtobj.errmsg=result.error;
     var writeret = await jslib.updateerror(wrtobj);
        if(!writeret.error)
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
        }
else
{
error_blink();
}
    } else {
        if(err<3)
        {
        console.log("worked");
        if (!fs.existsSync(datadir)){
            fs.mkdirSync(datadir);
        }
        try {
	var cmd;
	var args = [];
	if(resp.reindex =="true")
{
//cmd=`./zcashd --datadir=${datadir} --exportdir=${datadir} --conf=${confdir} --reindex`;
args = [`--datadir=${datadir}`,`--exportdir=${datadir}`,`--conf=${confdir}`,`--reindex`];
var writeret = await jslib.reindexreset();
}
else if(resp.rescan == "true")
{
//cmd=`./zcashd --datadir=${datadir} --exportdir=${datadir} --conf=${confdir} --rescan`;
args = [`--datadir=${datadir}`,`--exportdir=${datadir}`,`--conf=${confdir}`,`--rescan`];
var writeret = await jslib.rescanreset();
}
else
{
//cmd=`./zcashd --datadir=${datadir} --exportdir=${datadir} --conf=${confdir}`;
args = [`--datadir=${datadir}`,`--exportdir=${datadir}`,`--conf=${confdir}`];
}
rpio.write(pin, rpio.HIGH);

child = spawn('./zcashd',args);
child.on('error', (error) => {
  console.error('zcashd process error:', error);
  rebootOnErr();
});

child.on('close', (code) => {
  console.log('zcashd process exited with code:', code);
  rebootOnErr();
});
          } catch (error) {
        rebootOnErr();
          }
        }
        else
{
error_blink();
}
    }
  });
    }
}
}

async function rebootOnErr()
{
	if(require('os').uptime()<5400)
	{
        var err = resp.err+1;
        exec(`tail -n 15 ${logfile}`, async (error, stdout, stderr) => {
           var errmsg=(stdout);
        var writeret = await jslib.updateerror({"err":err,"errmsg":errmsg});
        if(!writeret.error)
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
        });
}
else
 require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
}



setInterval(async () => {
console.log("Interval set");
try {
        const response = await fetch('https://update.zcash.nodecipher.com/', {
      method: 'POST',   });
  const updateInfo = await response.json();
  console.log("received response from update server");
    const currentFileMd5 = await crypto.createHash('md5').update(fs.readFileSync(executablePath)).digest('hex');
     console.log(currentFileMd5);
	console.log(updateInfo);
	if (updateInfo.md5sum !== currentFileMd5) {
console.log("remote md5 not matching with local initiating update function");
if(resp.update==="true")
{
console.log("Killing zcashd and starting download");
        var updateid = update_blink();
	//spawn('pkill', ['zcashd'] );
      const downloadResponse = await fetch("https://"+updateInfo.downloadurl);
      const newFileBuffer = await downloadResponse.buffer();
        console.log("download complete");
      const newFileMd5 = await crypto.createHash('md5').update(newFileBuffer).digest('hex');
        console.log("new donwload file md5 = "+newFileMd5);
      if (newFileMd5 === updateInfo.md5sum) {
        await fs.renameSync(executablePath, executablePath + '.old');
        await fs.writeFileSync(executablePath, newFileBuffer);
        await fs.chmodSync(executablePath, 0o755);
        console.log("rename complte");
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
      } else {
        console.error('Downloaded file checksum mismatch!');
	clearInterval(updateid);
	rpio.write(pin, rpio.HIGH);
      }
}
else
{

}

    }
  } catch (error) {
    console.error('Update error:', error);
  }


} , 12*60*60*1000);



setInterval(async () => {

await jslib.resetlogin();

} , 5*60*1000);

app.use("/",homeroute)
app.use("/login",loginroute)
app.use("/settings",settingsroute)
app.use("/reset",resetroute)
app.use("/reindex", reindexroute);
app.use("/rescan", rescanroute);
app.use("/register",regroute)
app.use("/dashboard",dashroute)
app.use("/wallet",wallroute)
app.use("/settread",settread)
app.use("/diskread",diskread)
app.use("/walletexport",wallexport)
//app.use("/walletimport",wallimport)
app.use("/newaddr" , newaddr)
app.use("/balance" , balroute)
app.use("/addresslist" , addresslist)
app.use("/txnhistory" , txnhistory)
app.use("/shieldfunds",shieldroute)
app.use("/send",sendroute)
//app.use("/encr" , encroute)
//app.use("/test" , testroute)
app.use("/error" , errorroute)
app.use("/update" , updateroute)
app.use("/chktxn", chktxnroute)
app.use("/gettxn", gettxnroute)
app.listen((80),()=>{

    console.log("Server is Running")
	console.log("Current directory:", __dirname);

})
