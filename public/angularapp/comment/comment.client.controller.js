angular.module('comment')
    .controller('CommentsController', CommentsController)

function CommentsController(CommentsService,
                            CommentService,
                            CommentsNewestService,
                            UserService, modalService) {

    var vm = this;
    vm.commentsData = CommentsService;
    vm.commentData = CommentService;
    vm.userData = UserService

    vm.addComment = function (form) {
        if (!UserService.isUserExist) {
            document.querySelector("#user-login").click();
            return;
        }

        if (form.content.$untouched) {
            form.content.$setValidity("empty", false);
        }

        if (form.$valid && !vm.commentData.isRefresh) {
            var config = {
                content: vm.commentData.data.content
            };

            vm.commentData.addComment(config).then(
                function () {
                    vm.commentData.data.content = "";
                    CommentsNewestService.getNewestComments();
                }, function () {
                    vm.commentData.data.content = "";
                }
            );
        }
    }

    vm.popupDeleteCommentConfirm = function (index, comment) {
        CommentService.commentIndex = index;
        CommentService.comment = comment;
        modalService.init({
            templateUrl: '/angularapp/user/user.deletecomment.confirm.html',
            closeModal: ['.modal-close-btn', '.modal-bg', '.button-cancel'],
            controller: "CommentsController",
            controllerAs: "Comment"
        })
    }

    vm.deleteComment = function () {
        CommentService.deleteComment(CommentService.comment.commentId).then(
            function () {
                vm.commentsData.data.splice(CommentService.commentIndex, 1);
                modalService.closeDialog().then(
                    function () {
                        modalService.init({
                            template: {
                                content: "删除成功",
                            },
                            closeTime: 800
                        })
                    }
                )
            }
        )
    }
}

