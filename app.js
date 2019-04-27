// imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const socket = require('socket.io');
var fs = require("fs");
var path = require("path");
var sockets = [];
const mongoose = require('mongoose');
var User = require('./models/user');
var DB_URI = "mongodb://localhost:27017/NETW";
mongoose.connect(DB_URI);

//enabling server
const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});

// starting the socket
var io = socket(server);

app.use(express.static('public'));
app.get('/', function(req, res) {
    res.render('el.ejs');
});



//starting the socket connection
io.sockets.on('connection', function(socket) {
  var room = ""

  // when the user enters the data (name,password,....)
    socket.on('enter', function(data){
      var flag = 0
      //setting his name so the front end would use his name
      socket.username = data.me
      //saving his socket to check on him when someone wants to chat with him
      sockets.push(socket)


      //authentication
      User.findOne({username:data.me},function(err,user){
			if(err){
        console.log(err)
			}else{
				if(user){
          //if the user exist do the hashing check
          //send the response to the front end to alert
          io.emit('auth_response', 'yes');
					}else{
            // if the user doesn't exist hash the password and register him in the system
            var User1 = new User({username:data.me, password:data.pass})
            //save the user in the database
            User1.save(function (err, User) {
               if (err) {
                   console.log(err);
               }
           })
           //tell the front end that the user didn't exist before and a new user was created
           io.emit('auth_response', 'no');
					}

			}
		});

      // check on the type of chat the user want either a group or a name of a person
      if(data.typerad == "name"){
        // if its a user we look for him in the sockets online now
        for (i in sockets){
          if (sockets[i].username == data.name ){
            flag = 1
          }
        }
        if (flag ==1){
          // if he is there we make him join the room with his partner
          room = data.name + "_" + data.me
          socket.join(room)
          io.to(room).emit('is_online', '🔵 <i>' + data.name + ' is online </i>');
        }else{
          // if he is not we make a new room and tell him that his partner is not online
          room =data.me + "_" + data.name
          socket.join(room)
          io.to(room).emit('is_online', '🔴 <i>' + data.name + ' is offline');
        }
      }else{
        // if its a group we create a group by this name and make him join it
        room = data.name
        socket.join(room)
        io.to(room).emit('is_online', '🔵 <i> you are in '+ data.name + ' </i>');
      }
    });
    socket.on('username', function(username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        io.to(room).emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });

    // if a file is being uploaded
    socket.on('base64 file', function (msg) {
    console.log('received base64 file from' + msg.username);
    var file = msg.file.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("./public/uploads/"+ msg.fileName, file,'base64', (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
    // socket.broadcast.emit('base64 image', //exclude sender
    //
    io.to(room).emit('chat_message', '<strong>' + socket.username + '</strong>: ' + '<a href=\"/uploads/' + msg.fileName + '\" download>' + '  <button>'+msg.fileName+' </button>  </a>');

});





});
