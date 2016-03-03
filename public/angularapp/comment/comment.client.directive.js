angular.module('comment')
    .directive('strongComment', strongComment)

function strongComment($location, $timeout) {
    return {
        restrict: "A",
        link: function (scope, ele, attr) {
            var commentId = $location.hash();
            if (commentId) {
                $timeout(function () {
                    var targetComment = ele[0].querySelector("#commentid_" + commentId)
                    scrollToElement(targetComment, -70);
                    targetComment = angular.element(targetComment);
                    targetComment.addClass("strong-comment");
                })
            }

        }
    }
}