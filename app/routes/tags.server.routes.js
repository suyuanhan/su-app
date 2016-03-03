var tagsActions = require('../controllers/tags.server.controller');
var config = require('../../config/config');

module.exports = function (app, router) {

    app.get('/tagsdata', tagsActions.getAllPublicTags)
    app.get('/tagposts/:tagname', tagsActions.getTagPosts);
    app.get('/tagposts', tagsActions.getEmptyTagPosts);
}