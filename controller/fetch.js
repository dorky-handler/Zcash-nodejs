const fetch = require('node-fetch');
const jslib = require("../controller/jsonread");
const btoa = function(str) { return Buffer.from(str).toString('base64'); }
var cookie="";
var resp={};
//var method = "getblockchaininfo";
var params=[];
var datadir = "~/mnt/node/";
//get cookie val from file using controller jsread
async function rpc(data)
{
cookie = jslib.cookieread() ;
//return cookie;
//cookie = fs.readFileSync(datadir + ".cookie", 'utf-8');
//console.log("cookie - "+ cookie.message);
try {
const sre = await fetch('http://localhost:8232/', {
//const sre = await fetch('http://127.0.0.1:8232/', {
  method: 'POST',
  headers: {
    'content-type': 'text/plain;',
    'Authorization': 'Basic ' + btoa(cookie.message)
  },
  body: '{"jsonrpc": "1.0", "id":"zcashnode", "method": "'+data.method+'", "params": '+JSON.stringify(data.params)+' }',
  timeout: 30000
})
resp = JSON.parse(await sre.text());
}
catch (error) {
var message={"message":error.message};
resp.error=message;
}
//console.log(resp);
return resp;
}


module.exports = { rpc };


