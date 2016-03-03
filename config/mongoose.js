var config = require('./config');
var mongoose = require('mongoose');

module.exports = function(){
    var db = mongoose.connect(config.mongodbURI);
    require('../app/models/user.server.model');
    require('../app/models/post.server.model');
    require('../app/models/tags.server.model');
    require('../app/models/comment.server.model');
    return db;
}