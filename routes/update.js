const express=require("express")
const router=express.Router()
const jslib = require("../controller/jsonread");
var fs = require('fs');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { spawn } = require("child_process");
var executablePath = "/home/pi/node/zcashd";
var resp =jslib.jsread();


router.get("/",async (req,res,next)=>{


if (!req.session.key) {
res.send({"error":true,"message":"Login before updating the device."});
  }
else
{
 const response = await fetch('https://update.zcashnode.stagnum.finance/', {
      method: 'POST',   });

  const updateInfo = await response.json();

    const currentFileMd5 = crypto.createHash('md5').update(fs.readFileSync(executablePath)).digest('hex');

    if (updateInfo.md5sum !== currentFileMd5) {


console.log("Killing zcashd and starting download");
        spawn('pkill', ['zcashd'] );
      // Download new file
res.send({"error":"false","message":"Device will update now and reboot. Check in after a few minutes."});
      const downloadResponse = await fetch("https://"+updateInfo.downloadurl);
      const newFileBuffer = await downloadResponse.buffer();
        console.log("download complete");
      const newFileMd5 = crypto.createHash('md5').update(newFileBuffer).digest('hex');
        console.log("new donwload file md5 = "+newFileMd5);
      if (newFileMd5 === updateInfo.md5sum) {
        // Rename old file
        fs.renameSync(executablePath, executablePath + '.old');
        // Write new file
        fs.writeFileSync(executablePath, newFileBuffer);
        fs.chmodSync(executablePath, 0o755);
        console.log("rename complete");
	resp.conf.updateavailable="false";
	resp.conf.updatename="";
	var writeret = await jslib.writeconf(resp.conf);
	console.log("Update logged to system");
	//res.send({"error":"false","message":"Update succesful. Device will reboot now."});
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
  // Restart the executable
       // childProcess.execFileSync(executablePath);
      } else {
        console.error('Downloaded file checksum mismatch!');

         //res.send({"error":"true","message":"Update failed due to mismatch in checksum , check your network."});
	}

}
}

});

module.exports=router
