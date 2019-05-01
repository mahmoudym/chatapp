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
var Group = require('./models/group');
var DB_URI = "mongodb://localhost:27017/NETW";
mongoose.connect(DB_URI);

var clients = [];
const server = http.listen(8080, function() {
    console.log('public server listening on *:8080');
});
var io = socket(server);
io.sockets.on('connection', function(socket) {

  socket.on('private_chat', function(data){
    for (i in clients){
      clients[i].emit('find_user', data);
    }

  });
  socket.on('new_private', function(data){
    var client = null
    if (clients.length!=0){
      for (i in clients){
        if(clients[i].name == data.friend){
          client = clients[i];
          break;
        }
      }
      socket.emit('found_user2',client.port);
      client.socket.emit('found_user', data.port);
      }else{
        var user = {socket:socket,name:data.me,port:data.port}
        clients.push(user);
      }
  });
});
