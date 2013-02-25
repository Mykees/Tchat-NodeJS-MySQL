var http = require('http');
var md5  = require('MD5');
var _mysql = require('mysql');


//create server
httpServer=http.createServer(function(req,res){
	console.log('affichage de la page');
	res.end('Hello world');
});
httpServer.listen(1000);


var io = require('socket.io').listen(httpServer);
var users = {},
	host = "localhost",
	user = 'root',
	pass = '',
	db   = 'nodejs',
	table= 'comments';

var mysql = _mysql.createConnection({
    host: host,
    user: user,
    password: pass,
});
mysql.query('use ' + db);


io.sockets.on('connection',function(socket){
	
	var current_user = false;
	console.log("Nouveau utilisateur");

	for(var k in users){
		socket.emit('newusr', users[k]);//Renvoi les donnée au client.js
	}
	//Get the last message
	mysql.query('select * from ' + table +' order by id desc limit 3',
	function(err, result, fields) {
	    if (err) throw err;
	    else {
	        console.log('----------------------------------');
	        for (var i in result) {
	            var res = result[i];
	            var message = {};
	            message.user    = res.username;
	            message.avatar  = res.avatar;
	            message.date    = res.date;
	            message.contenu = res.message;
	        	socket.emit('newmsg',message);
	        }
	    }
	});

	/**
	* Connection of user
	**/
	socket.on('login',function(user){
		
		current_user = user;
		current_user.mail = user.mail;
		current_user.id = user.mail.replace('@','-').replace('.','-');
		current_user.avatar = 'https://gravatar.com/avatar/'+md5(user.mail)+"?s=50";
		socket.emit('logged');
		users[current_user.id] = current_user;
		io.sockets.emit('newusr', current_user);

	});

	/**
	* Reception of the message
	**/
	socket.on('newmsg',function(message){

		var date  = new Date(),
			month = date.getMonth() + 1,
			day   = date.getDate(),
			year  = date.getFullYear(),
			h     = date.getHours(),
			m     = date.getMinutes(),
			s     = date.getSeconds();

		mysql.query('insert into '+ table +' (username, message, email, avatar, date) values ("' + current_user.username + '", "' + message.message + '","' + current_user.mail + '","' + current_user.avatar + '","'+ year + "/" + month + "/" + day + " " + h + ":" + m + ":" + s +'")',
		function selectCb(err, results, fields) {
		    if (err) throw err;
		    else console.log('success');
		});
		mysql.query('select * from ' + table,
		function(err, result, fields) {
		    if (err) throw err;
		    else {
		        console.log('----------------------------------');
		        for (var i in result) {
		            var res = result[i];
		            //console.log(gadget.username +': '+ gadget.message);
		            message.user = res.username;
		            message.avatar = res.avatar;
		            message.date = res.date;
		            message.contenu = res.message;
		        }
		        io.sockets.emit('newmsg',message);
		    }
		});
	});

	/**
	* Deconnection
	**/
	socket.on('disconnect',function(){
		if(!current_user){
			return false;
		}
		delete users[current_user.id];
		io.sockets.emit('discusr',current_user);
	});
});