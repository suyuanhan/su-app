var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [{
        type: Schema.ObjectId,
        ref: 'Tag'
    }],
    postprivacy: {
        type: String,
        enum: ["public", "private"]
    },
    creator: {
        type: Schema.ObjectId,
        ref: "User"
    },
    lastCommentUser: {
        type: Schema.ObjectId,
        ref: "User"
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
    createdAt: Date,
    updateAt: Date
})

Post.pre('save', function (next) {
    var currentDate = new Date();
    if (!this.createdAt) {
        this.createdAt = currentDate;
    }
    this.updateAt = currentDate;
    next();
})

mongoose.model('Post', Post);