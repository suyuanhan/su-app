angular.module('comment')
    .factory('CommentsService', CommentsService)
    .factory('CommentService', CommentService)
    .factory('CommentsNewestService', CommentsNewestService)

//获取文章评论列表服务
function CommentsService(BaseDataModel, Restangular, $q) {

    var commentsModel;

    commentsModel = new BaseDataModel();

    commentsModel.getCommentsByPostId = function (postId) {
        commentsModel.isRefresh = true;
        return Restangular.all("comments").one(postId).get().then(
            function (data) {
                commentsModel.setData(data);
            }, function () {
                commentsModel.isRefresh = false;
                $q.reject("get comments failed");
            }
        )
    }

    commentsModel.getUserComments = function (username) {
        commentsModel.isRefresh = true;
        return Restangular.all("userdata").one(username).one("comments").getList().then(
            function (data) {
                commentsModel.setData(data);
            }, function (err) {
                commentsModel.clearData();
                $q.reject("no comments");
            }
        )
    }

    return commentsModel;

}

//评论的增加 删除操作服务
function CommentService(BaseDataModel, $q, Restangular, $stateParams, detectedPreventCloseService) {

    var commentModel;
    commentModel = new BaseDataModel();

    var commentRest = Restangular.all("comments");

    commentModel.addComment = function (commentData) {

        commentModel.isRefresh = true;
        return commentRest.one($stateParams.postId).post("", commentData).then(
            function () {
                commentModel.isRefresh = false;
            }, function () {
                return $q.reject("failed to add comment");
                commentModel.isRefresh = false;
            }
        )
    }

    commentModel.deleteComment = function (commentId) {
        detectedPreventCloseService.isRefresh = true;
        commentModel.isRefresh = true;
        return commentRest.one(commentId).remove().then(
            function () {
                detectedPreventCloseService.isRefresh = false;
                commentModel.isRefresh = false;

            }, function () {
                detectedPreventCloseService.isRefresh = false;
                commentModel.isRefresh = false;
                $q.reject("not remove comment");
            }
        )
    }


    return commentModel;
}

//获取最新评论服务
function CommentsNewestService(BaseDataModel, CommentsService, $stateParams, Restangular) {

    var time;
    var newestComments = new BaseDataModel();

    var commentRest = Restangular.all("comments");

    function getNewestComments() {
        newestComments.isRefresh = true;
        if (CommentsService.data.length === 0) {
            commentRest.one($stateParams.postId).one("newestcomments").get({time: ""}).then(
                function (data) {
                    CommentsService.data = data;
                    newestComments.isRefresh = false;
                }, function (err) {
                    $q.reject("comments get newest failed");
                    newestComments.isRefresh = false;
                }
            )
        } else {
            time = CommentsService.data[CommentsService.data.length - 1].createTimemap;
            commentRest.one($stateParams.postId).one("newestcomments").get({time: time}).then(
                function (data) {
                    CommentsService.data = CommentsService.data.concat(data);
                    newestComments.isRefresh = false;
                }, function (err) {
                    newestComments.isRefresh = false;
                    $q.reject("failed to get newsest comment")
                }
            )
        }
    }

    return {
        getNewestComments: getNewestComments
    }
}
