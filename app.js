var config = require('./config/config');
var express = require('./config/express');
var mongoose = require('./config/mongoose');
var passport = require('./config/passport');
var logger = require('tracer').console();
var path = require("path");
global.appRoot = path.resolve(__dirname);

var db = mongoose();
var app = express();
var passport = passport();

var port = config.port;

app.listen(port, function () {
    console.log("start");
});

