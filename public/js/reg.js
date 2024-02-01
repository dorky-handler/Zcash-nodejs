$(document).ready(function(){
$("#submit").on("click" , function(e) {
	alert($("#name").val()); 
e.preventDefault();
    $.ajax({
     contentType: 'application/json',   
type: "POST",
        url: location.protocol+"//"+location.host+"/register",
        data: JSON.stringify({
            name: $("#name").val(), 
            password: $("#password").val() 
        }),
	datatype: 'json',
        success: function(result) {
	    $("#message").html(result.message);
		alert("redirecting to profile , sux reg");
		window.location.replace(location.protocol+"//"+location.host+'/settings');
        },
        error: function(result) {
            alert('error');
        }
    });
});
});
