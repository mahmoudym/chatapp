const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const socket = require('socket.io');
var path = require("path");
const bcrypt = require('bcrypt');
const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});
