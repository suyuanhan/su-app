var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logger = require('tracer').console();

var Comment = Schema({
    commentBy: {
        type: Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    postIn: {
        type: Schema.ObjectId,
        required: true,
        ref: "Post"
    },
    content: {
        type: String,
        required: true
    },
    createdAt: Date
})

Comment.pre('save', function (next) {
    var currentDate = new Date();
    this.createdAt = currentDate;
    next();
})

mongoose.model('Comment', Comment);