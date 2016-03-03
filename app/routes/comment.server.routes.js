var commentAction = require('../controllers/comment.server.controller');
var userAction = require('../controllers/user.server.controller');
var postAction = require('../controllers/post.server.controller');
var config = require('../../config/config');

module.exports = function (app, router) {

    app.post('/comments/:postId', userAction.checkUser, commentAction.saveComment);
    app.get('/comments/:postId', commentAction.GetCommentsByPostId);
    app.get('/comments/:postId/newestcomments', commentAction.getNewestComments);

    app.get('/comments/user/:username', commentAction.getCommentsByUsername)

    app.delete('/comments/:commentId', commentAction.deleteComment)

}