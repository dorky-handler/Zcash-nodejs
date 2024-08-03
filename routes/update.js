const express=require("express")
const router=express.Router()
const jslib = require("../controller/helper");
var fs = require('fs');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { spawn } = require("child_process");
var executablePath = "/home/pi/zcash-nodejs/zcashd";


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
res.send({"error":"false","message":"Device will update now and reboot. Check in after a few minutes."});
      const downloadResponse = await fetch("https://"+updateInfo.downloadurl);
      const newFileBuffer = await downloadResponse.buffer();
        console.log("download complete");
      const newFileMd5 = crypto.createHash('md5').update(newFileBuffer).digest('hex');
        console.log("new donwload file md5 = "+newFileMd5);
      if (newFileMd5 === updateInfo.md5sum) {
        fs.renameSync(executablePath, executablePath + '.old');
        fs.writeFileSync(executablePath, newFileBuffer);
        fs.chmodSync(executablePath, 0o755);
        console.log("rename complete");
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg); });
      } else {
        console.error('Downloaded file checksum mismatch!');

	}

}
}

});

module.exports=router
