const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const socket = require('socket.io');
var sockets = [];

const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});
var io = socket(server);
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.render('el.ejs');
});


io.sockets.on('connection', function(socket) {
    var room = ""
    socket.on('enter', function(data){
      var flag = 0
      socket.username = data.me
      sockets.push(socket)

      if(data.typerad == "name"){
        for (i in sockets){
          if (sockets[i].username == data.name ){
            flag = 1
          }
        }
        if (flag ==1){
          console.log("yeee");
          room = data.name + "_" + data.me
          socket.join(room)
          io.to(room).emit('is_online', '🔵 <i>' + data.name + ' is online </i>');
        }else{
          console.log("noooo");
          room =data.me + "_" + data.name
          socket.join(room)
          io.to(room).emit('is_online', '🔴 <i>' + data.name + ' is offline');
        }
      }else{
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

});
