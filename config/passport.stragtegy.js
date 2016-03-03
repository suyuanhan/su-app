var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');
var logger = require('tracer').console();

module.exports = function (req, res, next) {
    passport.use(new localStrategy(function (username, password, done) {
        logger.log('local str');
        User.findOne({username: username}, function (err, user) {
            if (err) {
                logger.log(err);
                return done(err);
            }
            if (!user) {
                logger.log('no user found');
                return done(null, false, {message: 'no user'});
            }
            if (!user.authenticate(password.toString())) {
                logger.log('not correct password' + password);
                return done(null, false, {message: 'no passs'});
            }
            return done(null, user);
        })
    }))
};

