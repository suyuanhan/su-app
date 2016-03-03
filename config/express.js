var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var logger = require('tracer').console();
var fs = require('fs');

module.exports = function () {

    var app = express();
    var router = express.Router();

    app.set('views', './app/views');
    app.set('view engine', 'ejs');
    app.use(express.static('./public'));

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use('/uploads', express.static(config.uploadPath));

    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.secret,
        maxAge: 4000
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    require('../app/routes/user.server.routes')(app, router);
    require('../app/routes/post.server.routes')(app, router);
    require('../app/routes/tags.server.routes')(app, router);
    require('../app/routes/comment.server.routes')(app, router);

    app.get('/*', function (req, res) {
        res.render('index');
    })

    return app;
}
