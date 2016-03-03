var userAction = require('../controllers/user.server.controller');
var commentAction = require('../controllers/comment.server.controller');
var postAction = require('../controllers/post.server.controller');
var passport = require('passport');
var logger = require('tracer').console();
var config = require('../../config/config');

module.exports = function (app, router) {

    app.route('/userstate/login')
        .post(userAction.authenticateUser, userAction.userLogin);

    app.post('/userstate/checktoken', userAction.checkToken);

    app.post('/userstate/checkuser', userAction.checkUser, userAction.getUser);
    app.get('/userstate/signout', userAction.signout);

    app.get('/check/username/:username', userAction.checkUserIsUnique);
    app.get('/check/email/:email', userAction.checkEmail);

    app.get('/userstate/checkuserauthority', userAction.checkUser, userAction.checkAuthority);

    //User Data
    app.post('/userdata', userAction.signUp)
    app.get('/userdata/:username',  userAction.getUserInfo);
    app.put('/userdata/:username', userAction.checkUser, userAction.userRequireConfirm, userAction.updateUserInfo)

    app.get('/userdata/:username/comments',  commentAction.getCommentsByUsername);
    app.get('/userdata/:username/posts',  postAction.getAllUserPosts);
    app.get('/userdata/:username/fav',  userAction.getUserFav);

    app.get('/userdata/:postId/switchfav', userAction.checkUser, userAction.switchFav);

}