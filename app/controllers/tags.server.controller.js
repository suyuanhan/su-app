var Tags = require('mongoose').model('Tag');
var Post = require('mongoose').model('Post');
var PostsMethods = require('./post.server.controller');
var q = require('q');
var logger = require('tracer').console();

//var updateOptions = [];
//设置更新的增值
//比如1,1代表publicCount增加1,totalCount增加1 -1则减一
var updateOption = function (publicVal, totalVal) {
    return {
        $inc: {publicCount: publicVal, totalCount: totalVal}
    }
}

//更新文章的时候,不同文章的公开属性对tags增值的影响
var updateOptions = function (newPrivacy, oldPrivacy) {

    var options = {};
    options.remove = {};
    options.add = {};
    var bothPublic = (newPrivacy === 'public' && newPrivacy === oldPrivacy);
    var bothPrivate = (newPrivacy === 'private' && newPrivacy === oldPrivacy);
    var oldPrivateNewPublic = (newPrivacy === 'public' && newPrivacy !== oldPrivacy);
    var oldPublicNewPrivate = (newPrivacy === 'private' && newPrivacy !== oldPrivacy);

    if (bothPublic) {
        options.remove = updateOption(-1, -1);
        options.add = updateOption(1, 1);
    }
    if (bothPrivate) {
        options.remove = updateOption(0, -1);
        options.add = updateOption(0, 1);
    }
    if (oldPrivateNewPublic) {
        options.remove = updateOption(0, -1);
        options.add = updateOption(1, 1);
    }
    if (oldPublicNewPrivate) {
        options.remove = updateOption(-1, -1);
        options.add = updateOption(0, 1);
    }
    return options;
}

exports.getEmptyTagPosts = function (req, res) {

    var skip, limit;
    try {
        skip = req.params.skip || req.body.skip || req.query.skip;
        limit = req.params.limit || req.params.limit || req.query.limit;

        Post.find({tags: []})
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
                if (!posts || posts.length == 0 || err) {
                    res.status(404).send([]);
                } else {
                    var postsData = posts.map(function (postObj) {
                        return PostsMethods.formatPostData(postObj);
                    })
                    res.send(postsData);
                }

            })
    } catch (e) {
        res.status(500).send([]);
    }
}

exports.getTagPosts = getTagPosts;

exports.updateOption = updateOption;

exports.tagsHandler = function (req, res, next) {

    if (!req.user) {
        return res.status(401).send({});
    }

    var tags = req.body.tags || req.body.data.tags;
    var postprivacy = req.body.postprivacy || req.body.data.postprivacy;
    getAllTags().then(
        function (tagNames) {
            var newTags = excludeTags(tagNames, tags);
            saveTags(newTags).then(function (data) {
                return postprivacy === 'public' ?
                    updateTags(tags, updateOption(1, 1)) : updateTags(tags, updateOption(0, 1))
            }).then(function (data) {
                return findTagsIdsByTagnames(tags)
            }).then(function (ids) {
                req.body.tags = ids;
            }).done(function () {
                next();
            })
        })
};

exports.convertToIds = function (req, res, next) {
    findTagsIdsByTagnames(req.body.tags).then(function (data) {
        var tagsIds = data;
        req.body.tags = tagsIds;
        next();
    });
}

//更新的时候对tags的数量进行处理
exports.getOldPostData = function (req, res, next) {

    var newPrivacy = req.body.postprivacy;
    var oldPrivacy = req.post.postprivacy;

    var updateOpt = updateOptions(newPrivacy, oldPrivacy);

    try {
        getAllTags().then(function (allTags) {
            var newTags = excludeTags(allTags, req.body.tags);
            return saveTags(newTags);
        }).then(function (data) {
            var oldPosttags = req.post.tags.map(function (tagsObj) {
                return tagsObj.tagname;
            })
            return updateTags(oldPosttags, updateOpt.remove);
        }).then(function (data) {
            return updateTags(req.body.tags, updateOpt.add);
        }).then(function (data) {
            return findTagsIdsByTagnames(req.body.tags);
        }).then(function (tagIds) {
            req.body.tags = tagIds
        }).done(function () {
            next();
        })
    } catch (e) {
        res.status(500).send({msg: "server error"});
    }


}

exports.getAllPublicTags = function (req, res) {
    try {
        var limit = req.params.limit || req.query.limit || req.body.limit;
        if (!limit) {
            limit = 0;
        }
        Tags.find({'publicCount': {$gt: 0}})
            .sort({'publicCount': 'desc'})
            .limit(limit)
            .exec(function (err, tags) {
                var tagsData = tags.map(function (tagObj) {
                    return formatTagsData(tagObj);
                })
                if (limit === 0) {
                    Post.find({tags: []}).exec(function (err, data) {
                        if (data.length > 0) {
                            tagsData.push({"tagName": " ", publicCount: data.length})
                        }
                        res.send(tagsData);
                    })
                } else {
                    res.send(tagsData);
                }

            })
    } catch (e) {
        res.status(500).send([]);
    }
}

exports.updateTags = updateTags;

exports.findTagsByIds = findTagsByIds;

function saveTags(tags) {
    var defer = q.defer();
    if (tags.length > 0) {
        var tagsObj = tags.map(function (val) {
            return {tagname: val}
        })
        Tags.create(tagsObj, function (err, data) {
            if (!err) {
                //返回包含所有tags属性的document
                defer.resolve(data);
            }
        })
    } else {
        defer.resolve('nothing inserted');
    }
    return defer.promise;
}

function updateTags(tags, updateOpt) {
    var defer = q.defer();
    Tags.update({tagname: {'$in': tags}}, updateOpt, {multi: true}, function (err, data) {
        if (!err) {
            //返回的是修改信息,比如 { ok: 1, nModified: 2, n: 2 }
            defer.resolve(data);
        } else {
        }
    })
    return defer.promise;
}

function excludeTags(leftArr, rightArr) {
    var tagsExcluded = [];
    rightArr.map(function (rightItem) {
        var leftFindIndex = leftArr.indexOf(rightItem);
        if (leftFindIndex === -1) {
            tagsExcluded.push(rightItem);
        }
    })
    return tagsExcluded;
}

//返回所有tags的tagname数组
function getAllTags() {
    var defer = q.defer();
    Tags.find({}).exec(function (err, tags) {
        if (err) {
            defer.reject(err);
        } else {
            var tagNames = tags.map(function (tagObj) {
                return tagObj.tagname;
            })
            defer.resolve(tagNames);
        }
    })
    return defer.promise;
};

function findTagsIdsByTagnames(tags) {
    var defer = q.defer();
    Tags.find({tagname: {$in: tags}}).exec(function (err, data) {
        if (!err) {
            var ids = data.map(function (idsObj) {
                return idsObj._id;
            })
            defer.resolve(ids);
        } else {
            defer.reject(err);
        }
    })
    return defer.promise;
}

function getTagPosts(req, res) {
    var skip, limit, tag, tagId;

    try {
        skip = req.params.skip || req.body.skip || req.query.skip;
        limit = req.params.limit || req.params.limit || req.query.limit;
        tag = req.params.tagname || req.query.tagname || req.body.tagname;

        if (tag) {
            Tags.findOne({tagname: tag}).exec(function (err, tagObj) {
                if (!tagObj) {
                    return res.status(404).send({msg: "not find tags"});
                } else {
                    tagId = tagObj._id;
                    Post.find({tags: {$all: [tagId]}})
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
                            if (err) {
                            } else {
                                // logger.log(posts);
                                var postsData = posts.map(function (postObj) {
                                    return PostsMethods.formatPostData(postObj);
                                })
                                res.send(postsData);
                            }
                        })
                }
            })
        }
    } catch (e) {
        res.status(404).send({msg: "server errror"});
    }
}

function findTagsByIds(ids) {
    var defer = q.defer();
    Tags.find({_id: {$in: ids}}).exec(function (err, data) {
        if (!err) {
            var tagsArr = data.map(function (idsObj) {
                return idsObj.tagname;
            })
            defer.resolve(tagsArr);
        } else {
            defer.reject(err);
        }
    })
    return defer.promise;
}

function formatTagsData(tagsData) {
    var _tagsData = {
        tagName: tagsData.tagname,
        publicCount: tagsData.publicCount
    }

    return _tagsData;
}
