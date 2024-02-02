var express = require('express');
var app = express();
var mountutil = require('linux-mountutils');
var fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const jslib = require("./controller/jsonread");
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
  secret:  "megasecretkey",
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
const notifroute=require("./routes/notification.js")
const settingsroute=require("./routes/settings.js")
const resetroute=require("./routes/reset.js")
const rescanroute = require("./routes/rescan.js");
const reindexroute = require("./routes/reindex.js");
const regroute=require("./routes/register.js")
const wallroute = require("./routes/wallet.js")
const newaddr = require("./routes/newaddr.js")
const settread = require("./routes/settingsread.js")
const diskread = require("./routes/diskread.js")
const downld = require("./routes/down.js")
const wallexport = require("./routes/walletexport.js")
//const wallimport = require("./routes/walletimport.js")
const balroute = require("./routes/balance.js")
const addresslist = require("./routes/addresslist.js")
const txnhistory = require("./routes/txnhistory.js")
const shieldroute = require("./routes/shieldfunds.js")
const sendroute = require("./routes/sendfunds.js")
//const encroute  = require("./routes/encr.js")
//const testroute = require("./routes/test.js")
const errorroute = require("./routes/error.js")
const updateroute =  require("./routes/update.js");
var resp=jslib.jsread();

//console.log(resp.error);
var child;
if(!resp.error)
{
//console.log(resp.conf);
    var drive = resp.conf.settings.drv;
    if(drive)
    {
var confdir=__dirname+"/zcash.conf";
console.log(`./zcashd --datadir=${datadir} --exportdir=${datadir} --conf=${confdir}`);
var err = ('error' in resp.conf);

mountutil.mount("/dev/"+drive,mountdir, { "createDir": true }, function(result) {
    if (result.error) {
      // Something went wrong!
      console.log(result.error);
      if(resp.conf.error<3||!err)
        {
      if('error' in resp.conf)
      resp.conf.error=resp.conf.error+1;
      else
      resp.conf.error=1;
     resp.conf.errmsg=result.error;
     var writeret = jslib.writeconf(resp.conf);
        if(!writeret.error)
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
        }
else
{
error_blink();
}
    } else {
        if(resp.conf.error<3||!err)
        {
        console.log("worked");
        if (!fs.existsSync(datadir)){
            fs.mkdirSync(datadir);
        }
        try {
	var cmd;
	var args = [];
	if(resp.conf.settings.reindex =="true")
{
//cmd=`./zcashd --datadir=${datadir} --exportdir=${datadir} --conf=${confdir} --reindex`;
args = [`--datadir=${datadir}`,`--exportdir=${datadir}`,`--conf=${confdir}`,`--reindex`];
delete resp.conf.settings.reindex;
var writeret = jslib.writeconf(resp.conf);
}
else if(resp.conf.settings.rescan == "true")
{
//cmd=`./zcashd --datadir=${datadir} --exportdir=${datadir} --conf=${confdir} --rescan`;
args = [`--datadir=${datadir}`,`--exportdir=${datadir}`,`--conf=${confdir}`,`--rescan`];
delete resp.conf.settings.rescan;
var writeret = jslib.writeconf(resp.conf);
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





/*
            child =   exec(cmd, (error, stdout, stderr) => {
                if (error) {
    


              // console.error(stderr);
                 
        if('error' in resp.conf)
        resp.conf.error=resp.conf.error+1;
        else
        resp.conf.error=1;
        
        exec(`tail -n 15 ${logfile}`,  (error, stdout, stderr) => {
           resp.conf.errmsg=(stdout);
        var writeret = jslib.writeconf(resp.conf);
        if(!writeret.error)
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
        
        
        
        
        
            });
        }

 if (stderr) {


console.log("zcashd exit");
              console.log(stderr);

        if('error' in resp.conf)
        resp.conf.error=resp.conf.error+1;
        else
        resp.conf.error=1;

        exec(`tail -n 15 ${logfile}`,  (error, stdout, stderr) => {
           resp.conf.errmsg=(stdout);
        var writeret = jslib.writeconf(resp.conf);
        if(!writeret.error)
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });





            });
        }

});

*/


/*exec.stdout.on('data', function(data) {
    //Here is where the output goes

    console.log('stdout: ' + data);

});
        });


exec.stdout.on('data', function(data) {
    //Here is where the output goes

    console.log('stdout: ' + data);

});
*/
           // res.json({ message: `User ${username} created successfully!` });
          } catch (error) {
        
        /*    console.error(`Error creating user: ${error}`);
        response = {"error":true,"message":error};
        if('error' in resp.conf)
        resp.conf.error=resp.conf.error+1;
        else
        resp.conf.error=1;
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) });*/
        // res.status(500).json({ error: 'Failed to create user' });
          }
        }
        else
{
error_blink();
}
    }
  });


/*const startapp=exec("sudo mount /dev/"+drive+" "+datadir+" && ./zcashd --datadir="+datadir+"/node --conf="+__dirname+"/zcash.conf");
        startapp.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
        });
        startapp.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });
	startapp.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });

        startapp.on("close", code => {
            console.log(`child process exited with code ${code}`);
        });
*/

    }
}

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



function rebootOnErr()
{
	if('error' in resp.conf)
        resp.conf.error=resp.conf.error+1;
        else
        resp.conf.error=1;
        exec(`tail -n 15 ${logfile}`,  (error, stdout, stderr) => {
           resp.conf.errmsg=(stdout);
        var writeret = jslib.writeconf(resp.conf);
        if(!writeret.error)
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
        });
}



setInterval(async () => {
console.log("Interval set");
try {
        const response = await fetch('https://update.zcash.nodecipher.com/', {
      method: 'POST',   });
  const updateInfo = await response.json();
    const currentFileMd5 = crypto.createHash('md5').update(fs.readFileSync(executablePath)).digest('hex');
    if (updateInfo.md5sum !== currentFileMd5) {
console.log("remote md5 not matching with local initiating update function");
if(resp.conf.settings.update==="true")
{
console.log("Killing zcashd and starting download");
        var updateid = update_blink();
	//spawn('pkill', ['zcashd'] );
      const downloadResponse = await fetch("https://"+updateInfo.downloadurl);
      const newFileBuffer = await downloadResponse.buffer();
        console.log("download complete");
      const newFileMd5 = crypto.createHash('md5').update(newFileBuffer).digest('hex');
        console.log("new donwload file md5 = "+newFileMd5);
      if (newFileMd5 === updateInfo.md5sum) {
        fs.renameSync(executablePath, executablePath + '.old');
        fs.writeFileSync(executablePath, newFileBuffer);
        fs.chmodSync(executablePath, 0o755);
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
resp.conf.updateavailable="true";
resp.conf.updatename=updateInfo.name;
var writeret = jslib.writeconf(resp.conf);
console.log("Update logged to system");
}

    }
  } catch (error) {
    console.error('Update error:', error);
  }


} , 10*60*1000);





app.use("/",homeroute)
app.use("/login",loginroute)
app.use("/settings",settingsroute)
app.use("/reset",resetroute)
app.use("/reindex", reindexroute);
app.use("/rescan", rescanroute);
app.use("/register",regroute)
app.use("/notifications",notifroute)
app.use("/dashboard",dashroute)
app.use("/wallet",wallroute)
app.use("/settread",settread)
app.use("/diskread",diskread)
app.use("/download",downld)
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

app.listen((80),()=>{

    console.log("Server is Running")
	console.log("Current directory:", __dirname);

})
