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

var clients = [];
var groups = [];
const server = http.listen(8080, function() {
    console.log('public server listening on *:8080');
});
var io = socket(server);
io.sockets.on('connection', function(socket) {

  socket.on('user_auth', function(data){
    User.findOne({username:data.user},function(err,user){
      if(user){
        socket.emit('pass',user.password);
      }else{
        var User1 = new User({username:data.user, password:data.pass})
        //save the user in the database
        User1.save(function (err, User) {
           if (err) {
               console.log(err);
           }
      });
      }
    });

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
          var s = {name: m.name,port:m.port,admin:"no"};
          socket.emit('group_found',s)
          if(m.name == group.admin){
            var p = {name: me,port:port,admin:"yes"};
          }else{
            var p = {name: me,port:port,admin:"no"};
          }
          m.socket.emit('group_found', p);
        }
        var member = {socket:socket,port:port,name:me}
        membersd.push(member)
        var group2 = {name:group.name,membersnames:group.membersnames,membersd:membersd, admin: group.admin};
        groups.push(group2);
      }else{
        socket.emit('group_found',"no");
      }

    }else{
      var members = []
      var member = {socket:socket,port:port,name:me}
      members.push(member);
      var group = {name:groupname,membersnames:friends.slice(1,friends.length),membersd:members, admin: me};
      groups.push(group);
    }
  });
});
