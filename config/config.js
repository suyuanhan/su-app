var mongodbURI = ""
var port = "";
var uploadPath = ""

exports.port = port;
exports.uploadPath = uploadPath;
exports.mongodbURI = mongodbURI;

exports.defaultAvatar = "/images/avatar.jpg"
exports.secret = "su-app";

exports.randomObj = {
    ranNum: 0,
    rand: function () {
        this.ranNum = parseInt(Math.random() * 10000);
    }
}

exports.delayResponse = function (time) {
    function delay(req, res, next) {
        setTimeout(function () {
            next();
        }, time);
    }

    return delay;
}

exports.shortenStr = function (str, maxlength) {
    var checkLength;
    var strLength = 0;
    var endStr = "";
    for (checkLength = 0; checkLength < str.length; checkLength++) {
        if (strLength >= maxlength) {
            endStr = "...";
            break;
        }
        strLength += str.charCodeAt(checkLength) > 255 ? 2 : 1;
    }
    return str.substring(0, checkLength) + endStr;
}

function getLength(str) {
    var strLength = 0;
    for (var i = 0; i < str.length; i++) {
        strLength += str.charCodeAt(i) > 255 ? 2 : 1;
    }
    return strLength;
}

function getFileExtension(str) {
    var arr = str.split(".");
    return arr[arr.length - 1];
}
