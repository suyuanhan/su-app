var mongoose = require('mongoose');
var schema = mongoose.Schema;
var logger = require('tracer').console();

var tagSchema = new schema({
    tagname: {
        type: String,
        unique: true
    },
    publicCount: {
        type: Number,
        default: 0
    },
    totalCount: {
        type: Number,
        default: 0
    }
})

mongoose.model('Tag', tagSchema);