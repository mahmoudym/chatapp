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
var groups = [];
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

  socket.on('new_group', function(data){
    var port = data.port;
    var me = data.me;
    var friends = data.friends;
    var groupname = friends[0];
    if(friends.length == 1){
      console.log("yes")
      var i;
      for(i in groups){
        if(groups[i].name == groupname){
          break;
        }
      }
      var group = groups[i];
      groups.splice(i, 1);
      if(group.membersnames.includes(me)){
        var membersd= group.membersd;
        for(j in membersd){
          var m = membersd[j];
          var s = {name: m.name,port:m.port}
          socket.emit('group_found',s)
          var p = {name:me,port:port};
          m.socket.emit('group_found', p);
        }
        var member = {socket:socket,port:port,name:me}
        membersd.push(member)
        var group2 = {name:group.name,membersnames:group.membersnames,membersd:membersd};
        groups.push(group2);
      }else{
        console.log("not here");
        socket.emit('group_found',"no");
      }

    }else{
      console.log("no")
      var members = []
      var member = {socket:socket,port:port,name:me}
      members.push(member);
      var group = {name:groupname,membersnames:friends.slice(1,friends.length),membersd:members};
      groups.push(group);
    }
  });
});
