var fs = require('fs');
var crypto = require('crypto');
var resstr,retstr,lock=false;
const path = require('path');
var datadir=path.join(__dirname, "../../mnt/node/");



function generate6DigitCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


function encryptData(data, passphrase) {
  try
{
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(passphrase, Buffer.from(salt, 'hex'), 10000, 32, 'sha256');
  const dataString = JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encryptedData = cipher.update(dataString, 'utf-8', 'base64');
  encryptedData += cipher.final('base64');
  return { error:false , encryptedData: encryptedData, iv: iv.toString('hex'), salt: salt.toString('hex') };
}
catch(error)
{
console.log("Caught error while encrypting",error);
return { error:true , message:error};
}
}



async function decryptObj(encryptedData, iv, salt, passphrase) {

return new Promise((resolve) => {
        if (!encryptedData || !iv || !salt) {
        resolve({ error: true, message: 'Encryption Params missing' });
        }
        const iterations = 10000;
        const keySize = 32;
        console.log("passpharase = ",passphrase);
        console.log("typeof pass = "+typeof(passphrase));
        console.log("iv = " , iv);
        console.log("typeoof iv = "+typeof(iv));
        crypto.pbkdf2(passphrase, Buffer.from(salt, 'hex'), iterations, keySize, 'sha256', (err, derivedKey) => {
        if (err) {
        console.error('Error during key derivation:', err);
        resolve({ error: true, message: 'Error during key derivation.' + err });
        }
        try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, Buffer.from(iv, 'hex'));
        let decryptedData = decipher.update(encryptedData, 'base64', 'utf-8');
        decryptedData += decipher.final('utf-8');
        console.log('Decrypted Data:', decryptedData);
        var msg;
        if(!fs.existsSync('node.conf')) {
        resolve({
                error:true,
                message:'register',
                });
        }
        else
        {
        var data = fs.readFileSync('node.conf', 'utf-8');
        msg = data;
        }
        resolve({ error : false, message: 'Data received and decrypted successfully.', decrypted:decryptedData ,msg:msg});
        } catch (decryptionError) {
        console.error('Error during decryption:', decryptionError);
        resolve({ error: true, message: 'Error during decryption. Verify provided data and passphrase. ' + decryptionError });
        }
        });
  });
}



function cookieread()
{
var retcook;
if(!fs.existsSync(datadir+'.cookie')) 
{
retcook={"error":true,"message":"cookie file not found"};
return retcook;
}
else
{
var data = fs.readFileSync(datadir + '.cookie', 'utf-8');
retcook={"error":false,"message":data};
return retcook;
}
}


function cookieconf(token)
{
if(!fs.existsSync('node.conf')) {
retstr = {
error:true,
message:'register',
}
}
else
{
var data = fs.readFileSync('node.conf', 'utf-8');
let jconfig = JSON.parse(data);
if(jconfig.token==""||jconfig.token=="none"||jconfig.token!=token)
{
//retstr=token;
retstr={error:true,message:"login"};
}
else
{
retstr={
error:false,
redirect:'none',
msg:data
}
}
}
return retstr;
}

function jsread(){
if(!fs.existsSync('node.conf')) {
resstr = {
error:true,
message:'noconf',
conf:'none'
}
}
else 
{
var data = fs.readFileSync('node.conf', 'utf-8');

let jconfig = JSON.parse(data);
   // console.log(student);
//resstr="{\"error\":\"false\",\"message\":\"none\",\"conf\":\""+data+"\"}";
resstr={
error:false,
message:'none',
conf:jconfig
}
}
return resstr;
}

function writeset(arg)
{
var str = arg.node;
var conf = arg.conf;
var message={
error:true,
message:""};
if(!lock)
{
lock=true;
try {
  fs.writeFileSync('node.conf',JSON.stringify(str));
  fs.writeFileSync('zcash.conf',(conf));
  lock=false;
  message.error=false;
  message.message="success";
  return message;
  } catch (err) {
  // console.error(err);
  lock=false;
  message.message=err;
  return message;
 }
}
else
{
message.message="lock";
return message;
}
}


function writeconf(str)
{
var message={
error:true,
message:""}
if(!lock)
{
lock=true;
try {
  fs.writeFileSync('node.conf',JSON.stringify(str));
  lock=false;
  message.error=false;
  message.message="success";
  return message;
  } catch (err) {
  // console.error(err);
  lock=false;
  message.message=err;
  return message;
 }
}
else
{
message.message="lock";
return message;
}
}

module.exports = { jsread ,cookieconf , writeconf , cookieread , writeset , generate6DigitCode , decryptObj , encryptData };
