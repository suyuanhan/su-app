var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Tags = require('./tags.server.controller');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment')
var q = require('q');
var logger = require('tracer').console();
var moment = require('moment');
var passport = require('passport');
var config = require('../../config/config');
moment.locale("zh-cn");//设置moment语音

exports.deletePostById = function (req, res) {
    var postId = req.params.postId;
    try {
        if (postId) {
            Post.remove({_id: postId}).exec(function (err) {
                res.send({msg: "remove success"});
            })
        }
    } catch (e) {
        res.status(500).send("not remove");
    }

}

exports.checkIsFav = function (req, res, next) {
    if (req.user && req.post) {
        var postId = req.post._id;
        var postCopy = req.post.toObject();
        //logger.log(req.user.likes.indexOf(postId.toString()));
        if (req.user.likes.length > 0 && req.user.likes.indexOf(postId.toString()) > -1) {
            postCopy.isFav = true;
        } else {
            postCopy.isFav = false;
        }
        req.post = postCopy;
        next();
    } else {
        var postCopy = req.post.toObject();
        postCopy.isFav = false;
        req.post = postCopy;
        next();
    }
}

exports.getPostsData = function (req, res) {
    if (req.params.postId || req.query.postId || req.body.postId) {
        res.send(formatSinglePost(req.post));
    } else {
        res.send(req.posts);
    }
}

exports.create = function (req, res) {
    var post = null;
    if (req.body && req.user) {
        post = new Post(req.body);
        post.creator = req.user;
        post.lastCommentUser = post.creator;
        post.save(function (err, data) {
            if (err) {
                res.status(503).send({msg: "error happend in server"});
            } else {
                res.send(data)
            }
        })
    } else {
        res.status(403).send({msg: 'not engh params'})
    }
}

exports.updateDataHandler = function (req, res, next) {

    req.body.content = req.params.content || req.query.content || req.body.content;
    req.body.tags = req.params.tags || req.query.tags || req.body.tags;
    req.body.postprivacy = req.params.postprivacy || req.query.postprivacy || req.body.postprivacy;
    req.body.postId = req.params.postId || req.query.postId || req.body.postId;

    if (req.body.content && req.body.tags && req.body.postprivacy && req.body.postId && req.post) {
        next();
    } else {
        res.status(503).send({msg: "not engout params for update"});
    }
}

exports.updatePostById = function (req, res, next) {

    req.post.postprivacy = req.body.postprivacy;
    req.post.content = req.body.content;
    req.post.tags = req.body.tags;

    req.post.save(function (err, data) {
        if (err) {
            res.status(503).send({msg: 'not update post'});
        } else {
            res.send(data)
        }
    })

}

exports.getPostById = function (req, res, next) {
    try {
        var postId = req.params.postId || req.query.postId || req.body.postId;
        if (postId) {
            Post.findOne({_id: postId})
                .populate("creator")
                .populate("lastCommentUser", "username")
                .populate("tags")
                .sort({'createdAt': 'desc'})
                .exec(function (err, post) {
                    if (post) {
                        req.post = post;
                        next();
                    } else {
                        res.status(404).send({msg: 'not find post'});
                    }
                })
        }
    } catch (e) {
        res.status(500).send("not find postId");
    }

}

exports.getAllPublicPost = function (req, res, next) {
    var skip, limit;

    skip = req.params.skip || req.body.skip || req.query.skip;
    limit = req.params.limit || req.params.limit || req.query.limit;


    Post.find({"postprivacy": "public"})
        .populate([
            {
                path: "creator",
            },
            {
                path: "lastCommentUser",
                select: "username"
            },
            {
                path: "tags"
            }
        ])
        .sort({"updateAt": "desc"})
        .limit(limit)
        .skip(skip)
        .exec(function (err, posts) {
            if (!err) {
                config.randomObj.rand();
                var postsData = posts.map(function (postObj) {
                    return formatPostData(postObj);
                })
                req.posts = postsData;
                next();
            } else {
                res.status(503).send({msg: err});
            }
        })
    /*

     var postFind = commenQuery.docQuery(config);

     postFind.find().then(
     function (data) {
     var postsData = data.map(function (dataObj) {
     return formatPostData(dataObj)
     })
     req.posts = postsData;
     next()
     },
     function () {
     logger.log('failtoget post')
     res.status(503).send({msg: 'failed to get posts data'});
     }
     )
     */


}

exports.getAllUserPosts = function (req, res) {
    try {
        var username = req.query.username || req.params.username || req.body.username;
        User.findOne({'username': username}).exec(function (err, data) {
            if (data) {
                Post.find({'creator': data})
                    .sort({'createdAt': "desc"})
                    .exec(function (err, data) {
                        var postsData = data.map(function (dataObj) {
                            return {
                                title: dataObj.title,
                                postId: dataObj._id
                            }
                        })
                        res.send(postsData);
                    })
            }
        })
    } catch (e) {
        res.status(500).send("not find posts")
    }

};

exports.deletePostTags = function (req, res, next) {
    //var post = req.post;
    if (!req.user || req.user.username !== req.post.creator.username) {
        return res.status(403).send({msg: "user not allowed"});
    }
    if (req.post.tags.length < 1) {
        next();
    }
    Tags.findTagsByIds(req.post.tags)
        .then(function (tags) {
            return req.post.postprivacy === 'public' ?
                Tags.updateTags(tags, Tags.updateOption(-1, -1)) : Tags.updateTags(tags, Tags.updateOption(0, -1));
        })
        .then(function (data) {
            return deletePost(req.post);
        }).then(
        function (data) {
            //res.json(data);
            next();
        }, function (err) {
            return res.status(500).send({msg: 'deleted failed'});
        })
}

exports.deletePostComments = removeComments;

exports.findByPages = function (req, res, next) {

    var skip, limit;
    skip = req.params.skip || req.body.skip || req.query.skip;
    limit = req.params.limit || req.params.limit || req.query.limit;

    if (skip && limit) {
        Post.find({"postprivacy": "public"})
            .populate([
                {
                    path: "creator",
                    select: "username"
                },
                {
                    path: "lastCommentUser",
                    select: "username"
                },
                {
                    path: "tags"
                }
            ])
            .sort({"updateAt": "desc"})
            .limit(limit)
            .skip(skip)
            .exec(function (err, posts) {
                if (!err) {
                    config.randomObj.rand();
                    var postsData = posts.map(function (postObj) {
                        return formatPostData(postObj);
                    })
                    req.posts = postsData;
                    res.send(postsData);
                    //next();
                } else {
                    res.status(503).send({msg: err});
                }
            })
    } else {
        res.send({"msg": "not find params"});
    }
}

exports.findByTime = function (req, res) {
    var timemap = req.params.time || req.query.time || req.body.time;
    timemap = new Date(timemap);
    if (!isNaN(timemap.getDate())) {
        Post.find({updateAt: {"$gt": timemap}})
            .populate([
                {
                    path: "creator",
                    select: "username"
                },
                {
                    path: "lastCommentUser",
                    select: "username"
                },
                {
                    path: "tags"
                }
            ])
            .sort({"updateAt": "desc"})
            .exec(function (err, posts) {
                if (!err) {
                    config.randomObj.rand();
                    var postsData = posts.map(function (postObj) {
                        return formatPostData(postObj);
                    })
                    res.send(postsData);
                } else {
                    res.status(500).send({msg: err});
                }
            })
    } else {
        res.status(500).send({msg: "need time params"});
    }
}

exports.hasAuthentication = function (req, res, next) {
    if (req.user.id !== req.post.creator.id) {
        return res.status(403).send({
            msg: 'You can not modified this aritcle'
        })
    }
    next();
}

exports.formatPostData = formatPostData;

function formatPostData(post) {

    var postData = {
        postId: "",
        title: "",
        content: "",
        createdAt: "",
        lastUpdate: "",
        lastUpdateTimemap: null,
        creator: {
            userId: "",
            username: "",
            avatar: ""
        }
        ,
        lastCommentUser: {
            userId: "",
            username: "",
        }
        ,
        tags: [],
        postprivacy: "",
        commentsCount: 0
    }

    postData._id = post._id;
    postData.title = post.title;
    postData.content = config.shortenStr(post.content, 100);
    postData.lastUpdateTimemap = post.updateAt;
    postData.lastUpdate = moment(post.updateAt).format("hh:mm DD-MM-YYYY");
    postData.createdAt = moment(post.createdAt).fromNow();//.format("hh:mm DD-MM-YYYY");

    postData.creator.userId = post.creator._id;
    postData.creator.username = post.creator.username;
    postData.creator.avatar = post.creator.avatar + "?" + config.randomObj.ranNum;
    postData.lastCommentUser.username = post.lastCommentUser.username;
    postData.postprivacy = post.postprivacy;

    postData.commentsCount = post.comments.length;
    postData.tags = config.shortenStr(post.tags.map(function (tagObj) {
        return tagObj.tagname;
    }).join(), 20);

    return postData;
}

function formatSinglePost(post) {
    var postData = {};
    postData.title = post.title;
    postData.createdAt = moment(post.createdAt).fromNow();
    postData.content = post.content;
    postData.tags = post.tags.map(function (tagObj) {
        return tagObj.tagname;
    })
    postData._id = post._id;
    postData.isFav = post.isFav;

    postData.creator = {};
    postData.creator.username = post.creator.username;
    postData.creator.avatar = post.creator.avatar;

    return postData;
}

function deletePost(post) {
    var defer = q.defer();
    post.remove(function (err) {
        if (!err) {
            defer.resolve({msg: 'success deleted'})
        } else {
            defer.reject(err);
        }
    })
}

function removeComments(req, res, next) {
    var comments = req.post.comments;
    if (comments.length < 1) {
        next();
    }
    Comment.remove({_id: {$in: comments}}, function (err, data) {
        if (err) {
            res.status(500).send({msg: "remove comment fail"});
        } else {
            next();
        }
    })
}


