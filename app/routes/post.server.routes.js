var postAction = require('../controllers/post.server.controller');
var userAction = require('../controllers/user.server.controller');
var tagsAction = require('../controllers/tags.server.controller');
var config = require('../../config/config');
var logger = require('tracer').console();

module.exports = function (app, router) {

    app.get('/postsdata', postAction.getAllPublicPost, postAction.getPostsData);

    app.post('/postsdata', userAction.checkUser, tagsAction.tagsHandler, postAction.create);

    app.get('/postsfind', postAction.findByPages);

    router.route("/:postId")
        .all(userAction.checkUser)
        .get(postAction.getPostById,
            userAction.userByID,
            postAction.checkIsFav,
            postAction.getPostsData)
        .put(
            userAction.userRequireConfirm,
            postAction.getPostById,
            postAction.updateDataHandler,
            tagsAction.getOldPostData,
            postAction.updatePostById)
        .delete(
            userAction.userRequireConfirm,
            postAction.getPostById,
            postAction.deletePostTags,
            postAction.deletePostComments,
            postAction.deletePostById);

    app.use('/postsdata', router);

}
