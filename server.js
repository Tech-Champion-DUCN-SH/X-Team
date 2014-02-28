var express = require('express');

var server = express();
server.use(express.static(__dirname + '/static'));
server.listen(3000);
