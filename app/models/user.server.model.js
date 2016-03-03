var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var config = require('../../config/config');

var UserSchema = Schema({
    username: {
        type: String,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String
    },
    description: {
        type: String,
        default: "没有任何描述"
    },
    avatar: {
        type: String,
        default: config.defaultAvatar
    },
    salt: {
        type: String
    }
    ,
    provider: {
        type: String,
        required: "need provider"
    },
    likes: [{
        type: Schema.ObjectId,
        ref: 'Post',
        default: []
    }],
})

UserSchema.pre('save', function (next) {
    if (this.password && !this.salt) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
})

UserSchema.methods.hashPassword = function (password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
}

UserSchema.static.findOneByUsername = function (username, callback) {
    this.findOne({username: username}, callback);
}

UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
}

mongoose.model('User', UserSchema);
