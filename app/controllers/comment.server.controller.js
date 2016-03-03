var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var Post = mongoose.model('Post');
var logger = require('tracer').console();
var moment = require('moment');
var clone = require('clone');
var passport = require('passport');
var config = require('../../config/config');

moment.locale("zh-cn");

exports.saveComment = function (req, res) {
    try {
        var newComment;
        var content = req.body.content || req.query.content;
        var postId = req.params.postId || req.body.postId;

        Post.findOne({_id: postId}).exec(function (err, postData) {
            if (!err) {
                newComment = new Comment({
                    content: content,
                    postIn: postData._id,
                    commentBy: req.user._id
                })

                newComment.save(function (err, commentData) {
                    if (!err) {
                        postData.comments.push(commentData._id)
                        postData.save(function (err, data) {
                            res.send("success add comment")
                        })
                    }
                })
            }
        })
    } catch (e) {
        res.status(500).send("failed add comment");
    }
}

exports.deleteComment = function (req, res) {
    try {
        var postId, indexComment;
        var commentId = req.params.commentId;
        Comment.findOne({_id: commentId}).exec(function (err, comment) {
            postId = comment.postIn;
            Post.findOne({_id: postId}).exec(function (err, post) {
                indexComment = post.comments.indexOf(commentId);
                post.comments.splice(indexComment, 1);
                post.save(function (err, postData) {
                    Comment.remove({_id: commentId}, function (err, data) {
                        res.send("remove success");
                    })
                })
            })
        })
    } catch (e) {
        res.status(500).send("remove failed");
    }
}

exports.GetCommentsByPostId = GetCommentsByPostId;

exports.getCommentsByUsername = getCommentsByUsername;

exports.getNewestComments = function (req, res) {
    var timemap = req.params.time || req.query.time || req.body.time;
    var postId = req.params.postId || req.query.postId || req.body.postId;
    var findCondition = {};

    if (timemap) {
        findCondition = {postIn: postId, createdAt: {"$gt": new Date(timemap)}}
    } else {
        findCondition = {postIn: postId}
    }

    Comment.find(findCondition)
        .populate("commentBy")
        .exec(function (err, comments) {
            if (err) {
                res.send(err);
            } else {
                config.randomObj.rand();
                var commentsData = comments.map(function (commentObj) {
                    return formatCommentData(commentObj);
                })
                //logger.log(commentsData, "newest dta");
                res.send(commentsData);
            }
        })

}

function GetCommentsByPostId(req, res, next) {
    try {
        var postId = req.params.postId || req.query.postId || req.body.postId;
        Post.findOne({_id: postId})
            .populate([{
                path: "comments",
                select: "content createdAt commentBy",
                populate: {
                    path: "commentBy",
                    select: "username avatar"
                }
            }])
            .sort({'createdAt': 'desc'})
            .exec(function (err, postData) {
                if (err || !postData) {
                    res.status(404).send([]);
                } else {
                    config.randomObj.rand();
                    var commentsData = postData.comments.map(function (commentObj) {
                        return formatCommentData(commentObj)
                    })
                    res.send(commentsData)
                }
            })
    } catch (e) {
        res.status(500).send([]);
    }

}

function formatCommentData(commentData, options) {
    var commentDataFormatted = {
        creator: {
            username: "",
            avatar: ""
        },
        createTime: null,
        createTimemap: null,
        content: "",
        commentId: ""
    }

    commentDataFormatted.creator.username = commentData.commentBy.username;
    commentDataFormatted.creator.avatar = commentData.commentBy.avatar + "?" + config.randomObj.ranNum;

    commentDataFormatted.createTimemap = commentData.createdAt
    commentDataFormatted.createTime = moment(commentData.createdAt).fromNow();
    commentDataFormatted.content = commentData.content;
    commentDataFormatted.commentId = commentData._id;

    if (commentData.postIn) {
        commentDataFormatted.postIn = {};
        commentDataFormatted.postIn.title = commentData.postIn.title;
        commentDataFormatted.postIn._id = commentData.postIn._id;
    }
    if (options && options.shortenContent) {
        commentDataFormatted.content = config.shortenStr(commentData.content, 120);
    }
    /*

     if (commentData.postIn.title) {
     commentDataFormatted.postIn = {postId: "", title: ""}
     commentDataFormatted.postIn.postId = commentData.postIn._id;
     commentDataFormatted.postIn.title = commentData.postIn.title;
     }
     */

    return commentDataFormatted;
}


function getCommentsByUsername(req, res, next) {
    try {
        var username = req.params.username || req.query.username || req.body.username
        if (username) {
            User.find({username: username}).exec(function (err, user) {
                if (!err && user.length > 0) {
                    var userId = user[0]._id;
                    Comment.find({commentBy: userId})
                        .sort({"createdAt": "desc"})
                        .populate('postIn', 'title')
                        .populate('commentBy', 'username')
                        .exec(function (err, comments) {
                            if (!err) {
                                config.randomObj.rand();
                                var commentsFormatted = comments.map(function (commentObj) {
                                    return formatCommentData(commentObj, {shortenContent: true});
                                })
                                res.send(commentsFormatted);
                            } else {
                                res.status(503).send({msg: "faild to find comments"});
                            }
                        })
                } else {
                    res.status(503).send({msg: "faild to load data"});
                }
            })
        }
    } catch (e) {
        res.status(503).send({msg: "faild to load data"});
    }


}

