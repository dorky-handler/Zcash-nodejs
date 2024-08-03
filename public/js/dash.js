var htmlfirstpart = "<div class=\"element col-md-3 my-3 mx-1 bg-white h-50 text-center rounded shadow \"><div class=\"py-3\"><div class=\"col\"><div class=\"txtcol fnt\"><h5>";
var htmlscndpart="</h5></div><hr class=\"my-2 text-primary\"></div><div class=\"sz-7 fw-bold\">";
var htmlthirdpart="</div></div></div>";
var finalhtml = "<div class=\"row mx-2 mt-3 justify-content-between px-4\"></div>";
$(document).ready(function(){
jQuery.ajaxSetup({
  beforeSend: function() {
     $('.spinner-wrapper').show();
  },
  complete: function(){
     $('.spinner-wrapper').hide();
  },
  success: function() {}
});

$("#logout").on("click" , function(e) {
sessionStorage.clear();
location.replace(location.origin+"/login");
});


if(!sessionStorage.getItem("key"))
location.replace(location.origin+"/login");


$("#updateclosemodal").on("click" , function(e) {
$("#updatemodal").modal("hide");
});


$("#updateconfirmmodal").on("click" , function(e) {
 fetch(location.origin+'/update', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => alert('Error posting to server'));

});



$.get(location.protocol+"//"+location.host+'/dashboard', {category:'client', type:'premium'}, function(response){ 
if(!response.error)
{
if(response.dco)
{
$("#runbanner").removeClass("d-none");
}
else
{
$("#syncbanner").removeClass("d-none");
var newwid = (response.height/response.trueheight)*100;
$("#mainprogress").css("width",newwid+"%");
$("#mainprogress").html(Math.round(newwid * 100) / 100 + "%");
$("#progind").html(response.height+"/"+response.trueheight);
}
$("#console").append(htmlfirstpart+"Height"+htmlscndpart+response.trueheight.toLocaleString()+htmlthirdpart);
$("#console").append(htmlfirstpart+"Difficulty"+htmlscndpart+Math.round(response.diff*10)/10000 + "M"+htmlthirdpart);
$("#console").append(htmlfirstpart+"Node client"+htmlscndpart+response.client.slice(1, -1)+htmlthirdpart);
$("#console").append(htmlfirstpart+"No. of connections"+htmlscndpart+response.connections+htmlthirdpart);
$("#console").append(htmlfirstpart+"Size on disk"+htmlscndpart+Math.round(response.sizeondisk*10)/10 +"Gb"+htmlthirdpart);
$("#console").append(htmlfirstpart+"Uptime"+htmlscndpart+response.uptime+htmlthirdpart);
$("#console").append(htmlfirstpart+"Total memory"+htmlscndpart+Math.round((10*response.totalmem)/(1024*1024*1024))/10 + "Gb" +htmlthirdpart);
$("#console").append(htmlfirstpart+"Free memory"+htmlscndpart+Math.round((10*response.freemem)/(1024*1024*1024))/10+"Gb"+htmlthirdpart);
var totalsize=0;
for(var i=0;i<response.valuepools.length;i++)
{
var poolsize = parseInt(response.valuepools[i].chainValue);
$("#console").append(htmlfirstpart+response.valuepools[i].id+" Size :"+htmlscndpart+poolsize.toLocaleString()+" Zec"+htmlthirdpart);
totalsize+=parseInt(response.valuepools[i].chainValue);
}
$("#console").append(htmlfirstpart+"Total pool size: "+htmlscndpart+totalsize.toLocaleString()+" Zec"+htmlthirdpart);
if(response.download>99)
response.download=Math.round(response.download / 102.4 )/10+"Gb";
else
response.download=Math.round(response.download*100)/100+"Mb";
if(response.upload>99)
response.upload=Math.round(response.upload / 102.4 )/10+"Gb";
else
response.upload=Math.round(response.upload *100)/100+"Mb";
$("#console").append(htmlfirstpart+"Session download"+htmlscndpart+response.download+htmlthirdpart);
$("#console").append(htmlfirstpart+"Session upload"+htmlscndpart+response.upload+htmlthirdpart);
$("#console").append(finalhtml);
if(response.updateavailable=="true")
{
$("#updatetext").html("New version of Zcashd , version "+response.updatename+"available.It is recommended to download the latest version of zcashd.");
$("#updatemodal").modal("show");
}

}
else
{
if(response.message=="login")
window.location.replace(window.location.protocol + "//" +location.host + "/login");
if(response.message=="Loading block index..."||response.message=="Verifying blocks..."||response.message=="Rescanning..."||response.message=="Rewinding blocks if needed...")
$("#loadbanner").removeClass("d-none");
else
$("#errorbanner").removeClass("d-none");
}
});


});
