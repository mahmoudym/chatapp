const express = require('express');
const app = express();
const Crypt = require("g-crypt")
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const socketrec = require('socket.io');
var path = require("path");
const bcrypt = require('bcrypt');
const port = process.env.PORT||3030;
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
var cry1 = null;
var socketprivate2= null;
var cry2 = null;
var crykey = null;
var cry = null;
var socketgroup = [];
var friend = "";
var me = "";
var passw = "";
sockets = [];
// socket to client connection
io.on('connection', function(socket) {

  sockets.push(socket);

  socket.on('p2p',function(data){
      console.log("p2p")
      cry2 = Crypt(data.key);
      io.emit('is_online', '🔵 <i>' + data.name + ' is online..</i>');
  });

  socket.on('p2pok',function(data){
    console.log("p2pok")
      io.emit('is_online', '🔵 <i>' + data + ' is online..</i>');
  });

  socket.on('p2pg',function(data){
    if (data.key!="no"){
      if(cry == null){
        cry = Crypt(data.key);
      }
    }
      io.emit('is_online', '🔵 <i>' +data.name + ' is online..</i>');
  });

  socket.on('enter', function(data){
    socket.username = data.me;
    me = data.me;
    passw = data.pass;
    bcrypt.hash(data.pass, 10, function(err, hash) {
      var user = {user:me, pass:hash };
      socketsend.emit('user_auth',user);
    })

    if(data.typerad == "name"){
      var user = {port:server.address().port,me:data.me,friend:data.name };
      socketsend.emit('new_private',user);
    }else{
      friends = data.name.split(",");
      if(friends.length>1){
        crykey = makeid(15);
        cry = Crypt(crykey);
      }
      var user = {port:server.address().port,me:data.me,friends:friends};
      socketsend.emit('new_group',user)
    }

  });

  socket.on('chat_message', function(message) {
      if(socketprivate!=null){
        const encrypted = cry1.encrypt(message);
        var m = {name:me,message:encrypted};
        socketprivate.emit('recMessage',m);
      }
      if(socketprivate2!=null){
        const encrypted = cry2.encrypt(message);
        var m = {name:me,message:encrypted};
        socketprivate2.emit('recMessage',m);
      }
      if(socketgroup.length!=0){
        var encrypted = message;
        if(cry!=null){
        encrypted = cry.encrypt(message);
      }
        var m = {name:me,message:encrypted};
        for(i in socketgroup){
          socketgroup[i].emit('recMessage',m);
        }
      }
      io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
  });


  socket.on('recMessage', function(data){
    if(cry1!=null){
      var mess = cry1.decrypt(data.message);
    }else if(cry2!=null){
      var mess = cry2.decrypt(data.message);
    }else if (cry!=null){
      var mess = cry.decrypt(data.message);
    }
    io.emit('chat_message', '<strong>' + data.name + '</strong>: ' + mess);
  })


});


socketsend.on('found_user',function(data){
  socketprivate = require('socket.io-client')('http://localhost:' + data);
  const key = makeid(15);
  cry1 = Crypt(key)
  var f = {name:me, key: key};
  socketprivate.emit('p2p', f);

});
socketsend.on('found_user2',function(data){
  socketprivate2 = require('socket.io-client')('http://localhost:' + data);
  socketprivate2.emit('p2pok', me);

});

socketsend.on('group_found',function(data){
  if(data!="no"){
  var socketc = require('socket.io-client')('http://localhost:' + data.port);
  if(data.admin=="yes"){
    var s = {name: me , key:crykey};
  }else{
    var s = {name: me , key:"no"};
  }
  socketc.emit('p2pg',s);
  socketgroup.push(socketc);
}else{
  console.log('disconnect');
}

});

socketsend.on('pass',function(data){
  bcrypt.compare(passw, data, function(err, res) {
    if(!res) {
      socketsend.disconnect();
    }else{
      console.log("connected");
    }
  });
})

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
