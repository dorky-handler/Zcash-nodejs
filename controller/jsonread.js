var fs = require('fs');
var resstr,retstr;


function cookieconf(token)
{
if(!fs.existsSync('node.conf')) {
retstr = {
error:true,
redirect:'register',
}
}
else
{
var data = fs.readFileSync('node.conf', 'utf-8');
let jconfig = JSON.parse(data);
if(jconfig.token==""||jconfig.token=="none"||jconfig.token!=token)
{
//retstr=token;
retstr={error:true,redirect:"login"};
}
else
{
retstr={
error:false,
redirect:'none'
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
module.exports = { jsread ,cookieconf};
