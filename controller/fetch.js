const fetch = require('node-fetch');
const jslib = require("../controller/helper");
const btoa = function(str) { return Buffer.from(str).toString('base64'); }
var cookie="";
var resp={};
var params=[];
var datadir = "~/mnt/node/";
async function rpc(data)
{
cookie = jslib.cookieread() ;
try {
const sre = await fetch('http://localhost:8232/', {
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
return resp;
}


module.exports = { rpc };


