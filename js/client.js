jQuery(function($){

	var socket = io.connect('http://localhost:1000');
	var bubbletpl = $("#bubble").html();
	var lastmsg = false;
	 $("#bubble").remove();

	$('#loginForm').submit(function(event){
		event.preventDefault();
		socket.emit('login',{
			username : $('#username').val(),
			mail     : $('#email').val()
		});
	});
	/**
	* Remove aplat when user is connected
	**/
	socket.on('logged',function(){
		$('#aplat,#wrapFormLogin').fadeOut();
		$('#message').focus();
	});
	/**
	* send message
	**/
	$("#comment").submit(function(event){
		event.preventDefault();
		socket.emit('newmsg',{
			message : $('#message').val(),
		});
		$("#message").val('');
		$('#message').focus();
	});

	
	/**
	* Add the template
	**/
	socket.on('newmsg',function(message){
		
		if(lastmsg != message.user){
			$("#messages").append('<div class="spacer"></div>');
			lastmsg = message.user;
		}
		$("#messages").append('<div class="bubble">'+Mustache.render(bubbletpl,message)+'</div>');
		$("#messages").animate({scrollTop: $("#messages").prop('scrollHeight') },500);
		
	});

	/**
	* Add user avatar in sidebar
	**/
	socket.on('newusr',function(user){
		$('#sidebar').append('<div><img src="'+user.avatar+'" class="user-thumbs" id="'+user.id+'"></div>');
	});

	/**
	* Remove user from sidebar when he's deconnected 
	**/
	socket.on('discusr', function(user){
		$('#'+user.id).remove();
	});
})