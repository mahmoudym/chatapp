const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const socketrec = require('socket.io');
var path = require("path");
const bcrypt = require('bcrypt');
const port = process.env.PORT||3020;
const server = http.listen(port, function() {
    console.log('local server listening on ' + port);
});
var io = socketrec(server);
var socketsend = require('socket.io-client')('http://localhost:8080');
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.render('el.ejs');
});
var socketprivate = null;
var socketprivate2= null;
var socketgroup = [];
var friend = "";
var me = "";
sockets = [];
// socket to client connection
io.on('connection', function(socket) {

  sockets.push(socket);

  socket.on('p2p',function(data){
      console.log("p2p")
      io.emit('is_online', '🔵 <i>' + data + ' is online..</i>');
  });

  socket.on('p2pok',function(data){
    console.log("p2pok")
      io.emit('is_online', '🔵 <i>' + data + ' is online..</i>');
  });

  socket.on('p2pg',function(data){
      io.emit('is_online', '🔵 <i>' +data + ' is online..</i>');
  });

  socket.on('enter', function(data){
    socket.username = data.me;
    me = data.me;


    if(data.typerad == "name"){
      var user = {port:server.address().port,me:data.me,friend:data.name };
      socketsend.emit('new_private',user);
    }else{
      friends = data.name.split(",");
      var user = {port:server.address().port,me:data.me,friends:friends};
      socketsend.emit('new_group',user)
    }

  });

  socket.on('chat_message', function(message) {
      var m = {name:me,message:message};
      if(socketprivate!=null){
        socketprivate.emit('recMessage',m);
      }
      if(socketprivate2!=null){
        socketprivate2.emit('recMessage',m);
      }
      if(socketgroup.length!=0){
        for(i in socketgroup){
          socketgroup[i].emit('recMessage',m);
        }
      }
      io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
  });


  socket.on('recMessage', function(data){
    io.emit('chat_message', '<strong>' + data.name + '</strong>: ' + data.message);
  })


});


socketsend.on('found_user',function(data){
  socketprivate = require('socket.io-client')('http://localhost:' + data);
  socketprivate.emit('p2p', me);

});
socketsend.on('found_user2',function(data){
  socketprivate2 = require('socket.io-client')('http://localhost:' + data);
  socketprivate2.emit('p2pok', me);

});

socketsend.on('group_found',function(data){
  if(data!="no"){
  var socketc = require('socket.io-client')('http://localhost:' + data.port);
  socketc.emit('p2pg',me);
  socketgroup.push(socketc);
}else{
  console.log('disconnect')
}

});
