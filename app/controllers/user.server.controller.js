var User = require('mongoose').model('User');
var Post = require('mongoose').model('Post');
var Comment = require('mongoose').model('Comment');
var passport = require('passport');
var logger = require('tracer').console();
var moment = require('moment');
var jwt = require('jsonwebtoken');
var fs = require("fs");
var path = require("path");
var secretCode = "suApp"; //token的密钥key
var expireTime = 1440; //token的失效时间:一天
var q = require('q');
var config = require('../../config/config');

exports.signUp = function (req, res, next) {
    try {
        var username, email, pwd;
        username = req.body.username;
        email = req.body.email;
        pwd = req.body.password;
        var userData = {
            username: username,
            email: email,
            password: pwd
        }
        var user = new User(userData);

        user.provider = 'local';

        user.save(function (err, data) {
            req.login(user, function (err) {
                config.randomObj.rand();
                var userDataFormatted = userDataFormat(user)
                var token = jwt.sign(userDataFormatted, secretCode, {
                    expiresInMinutes: expireTime
                })
                var responseData = {
                    token: token,
                    userData: userDataFormatted
                }
                return res.status(200).send(responseData);
            })
        })
    } catch (e) {
        return res.status(401).send({
            msg: 'please sign out first or not enough params'
        });
    }
}

exports.signout = function (req, res) {
    req.logout();
    res.send({
        msg: 'signout user'
    });
}

exports.authenticateUser = function (req, res, next) {
    next();
};

exports.checkUser = function (req, res, next) {
    var token;
    token = req.headers.authorization || req.params.token || req.query.token || req.body.token;
    if (token) {
        jwt.verify(token, secretCode, function (err, decoded) {
            if (!err && decoded) {
                req.user = decoded;
                req.user.avatar = req.user.avatar;
                next();
            } else {
                req.user = null;
                next();
            }
        })
    } else {
        req.user = null;
        next();
    }
}

exports.userRequireConfirm = function (req, res, next) {
    if (req.user) {
        next()
    } else {
        res.status(401).send({});
    }
}

exports.checkAuthority = function (req, res) {
    var requestUsername = req.params.username || req.body.username || req.query.username;
    if (!req.user || requestUsername !== req.user.username) {
        res.status(403).send({
            "msg": "user not authority"
        });
    } else {
        res.send({
            "msg": "user is authorited"
        });
    }
}

exports.switchFav = function (req, res, next) {
    try {
        var favStatus;
        var postId = req.params.postId || req.query.postId || req.body.postId;
        if (req.user && postId && req.user._id) {
            User.findOne({
                _id: req.user._id
            }).exec(function (err, userData) {
                if (userData && userData.likes) {
                    var userLikes = userData.likes;
                    if (userLikes.indexOf(postId.toString()) === -1) {
                        userLikes.push(postId);
                        favStatus = true;
                    } else {
                        var indexPostId = userLikes.indexOf(postId.toString());
                        userLikes.splice(indexPostId, 1);
                        favStatus = false;
                    }
                    User.update({
                        _id: req.user._id
                    }, {
                        likes: userLikes
                    }, {
                        multi: true
                    }, function (err, result) {
                        if (!err) {
                            return res.send(favStatus);
                        } else {
                            res.status(500).send({});
                        }
                    })
                } else {
                    res.status(500).send({});
                }
            })
        } else {
            res.status(401).send({})
        }
    } catch (e) {
        res.status(500).send({});
    }
}

exports.getUserFav = function (req, res) {
    try {
        var username = req.params.username || req.body.username || req.query.username;
        if (username) {
            User.findOne({
                    username: username
                })
                .populate('likes')
                .exec(function (err, user) {
                    res.send(user.likes.reverse());
                })
        }
    } catch (e) {
        res.status(500).send([]);
    }
}

exports.checkUserIsUnique = function (req, res) {
    var username = req.query.username || req.params.username;
    //res.status(200).send({msg: 'successs'});
    if (username) {
        User.find({
            'username': username
        }).exec(function (err, user) {
            if (!err && user.length > 0) {
                res.status(400).send({
                    msg: 'username already exist'
                });
            } else {
                res.status(200).send({
                    msg: 'username can be used'
                });
            }
        })
    } else {
        res.status(400).send({
            msg: 'failed'
        });
    }
}

exports.checkEmail = function (req, res) {
    var email = req.params.email || req.query.email || req.body.email;
    if (email) {
        User.find({
            email: email
        }).exec(function (err, data) {
            if (err) {
                return res.status(500).send({
                    msg: 'server err'
                });
            } else if (data.length > 0) {
                return res.status(403).send({
                    msg: "find email"
                })
            } else if (data.length === 0) {
                return res.send({
                    msg: "not find email"
                });
            }
        })
    } else {
        return res.status(403);
    }

}

exports.getUser = function (req, res) {
    if (req.user !== null) {
        req.user = req.user;
        res.send(req.user)
    } else {
        req.user = undefined;
        req.logout();
        res.status(403).send({
            msg: "need user login"
        })
    }
}

exports.userLogin = function (req, res, next) {
    try {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                res.status(500).send({
                    msg: "出现未知错误"
                });
            }
            if (info) {
                res.status(403).send({
                    msg: info.message
                });
            }
            if (!err && !info) {
                req.logIn(user, function (err) {
                    if (!err) {
                        var userdata = userDataFormat(user);
                        var token = jwt.sign(userdata, secretCode, {
                            expiresInMinutes: expireTime
                        })
                        res.send({
                            userData: userdata,
                            token: token
                        });
                    } else {
                    }
                })
            }
        })(req, res, next);
    } catch (e) {
        res.send(500).send({});
    }
}

exports.userByID = function (req, res, next) {
    if (req.user) {
        User.findOne({
            _id: req.user._id
        }, function (err, user) {
            if (err) {
                return res.status(500).send({
                    msg: 'not find user'
                });
            } else {
                req.user = user;
                next();
            }
        })
    } else {
        next();
    }

}

exports.GetAuthentication = function (req, res, next) {
    if (req.user.username === req.params.username) {
        req.isUserSelf = true;
    } else {
        req.isUserSelf = false;
    }
    next();
}

exports.getUserInfo = getUserInfo;

exports.updateUserInfo = function (req, res) {
    var username;

    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.type = response.type.split("/")[1];
        response.data = new Buffer(matches[2], 'base64');
        return response;
    }

    try {
        var imgData = req.body.imgData || req.params.imgData || req.query.imgData;
        var description = req.body.description || req.params.description || req.query.description;
        var filePath;
        username = req.user.username;

        if (imgData) {
            var imgBuffer = decodeBase64Image(imgData)
            fs.writeFile(config.uploadPath + username + "." + imgBuffer.type, imgBuffer.data, function (err) {
                if (err) throw err;
                filePath = '/uploads/' + username + "." + imgBuffer.type;
                saveUserInfo(filePath);
            })
        } else {
            saveUserInfo();
        }

    } catch (e) {
        res.status(500).send({});
    }

    function saveUserInfo(filePath) {
        User.findOne({_id: req.user._id}).exec(function (err, user) {
            if (err) throw err;
            user.description = description;
            if (filePath) {
                user.avatar = filePath;
            }
            user.save(function (err, _user) {
                if (err) throw err;
                var userData = userDataFormat(_user);
                var token = jwt.sign(userData, secretCode, {
                    expiresInMinutes: expireTime
                })
                res.send({
                    "token": token,
                    "data": userData
                })
            })
        })
    }

}

exports.uploadAvatar = function (req, res) {
    var username = req.body.username || req.query.username || req.params.username;
    if (username) {
        res.send({
            "msg": username
        });
    } else {
        res.status(500).send({
            "msg": "not engout params"
        })
    }
}

exports.checkToken = function (req, res) {
    var token = req.body.token;
    if (!token) {
        return res.send({
            msg: 'not find token'
        });
    }
    jwt.verify(token, 'nn', function (err, decoded) {
        if (err) {
            return res.send({
                'msg': 'login fail'
            });
        } else {
            return res.send({
                msg: "login success"
            });
        }
    })
}

function getUserInfo(req, res, next) {
    var username = req.params.username || req.body.username;
    User.findOne({
        username: username
    }).exec(function (err, user) {
        if (!err && user) {
            res.send(userDataFormat(user));
        } else {
            res.status(404).send({
                msg: "error when finding user"
            });
        }
    })
}

function userDataFormat(userData) {
    var newUserData = {
        username: userData.username,
        avatar: userData.avatar + "?" + config.randomObj.ranNum,
        description: userData.description,
        _id: userData._id,
        likes: userData.likes
    }
    return newUserData;
}
