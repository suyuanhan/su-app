angular.module('post')
    .controller('PostListController', PostListController)
    .controller('PostSingleContentController', PostSingleContentController)
    .controller('PostController', PostController)

function PostListController(PostsService) {

    var vm = this;
    vm.postsData = PostsService;

}

function PostController(PostService, PostsService, modalService, $location) {

    var vm = this;

    vm.postFormDataModel = {};
    vm.formState = "";
    vm.title = PostService.title;
    vm.formState = PostService.formState;
    vm.postFormDataModel = PostService;

    vm.popupUpdatePostModal = function (postId) {
        PostService.formState = "update";
        PostService.title = "更新文章";
        modalService.init({
            templateUrl: '/angularapp/post/post.creator.html',
            closeModal: ['.modal-close-btn', '.modal-bg', '.button-cancel'],
            controller: 'PostController',
            controllerAs: "Post"
        }).then(
            function () {
            }, function () {
                vm.postFormDataModel.data = null;
            }
        )
        PostService.getPostData(postId);
    }

    vm.updatePost = function (form) {
        vm.formState = "update";
        if (!form.$valid) {
            return;
        }
        var updateData = {
            content: vm.postFormDataModel.data.content,
            tags: vm.postFormDataModel.data.tags,
            postprivacy: "public",
        }
        PostService.updatePostData(vm.postFormDataModel.data._id, updateData).then(
            function (response) {
                modalService.closeModal();
                $location.path('/post/' + response._id);
            }, function (error) {
            }
        )
    }

    vm.popupCreatePostModal = function () {
        PostService.formState = "create";
        PostService.title = "创建文章"
        PostService.clearData();
        modalService.init({
            templateUrl: '/angularapp/post/post.creator.html',
            closeModal: ['.modal-close-btn', '.modal-bg', '.button-cancel'],
            controller: 'PostController',
            controllerAs: "Post"
        })
    }

    vm.createPost = function (form) {
        if (form.title.$untouched) {
            form.title.$setValidity("empty", false);
        }
        if (form.content.$untouched) {
            form.content.$setValidity("empty", false);
        }
        if (form.$invalid) {
            return;
        }

        vm.postFormDataModel.data.postprivacy = 'public';

        PostService.postPostData(vm.postFormDataModel.data).then(
            function (data) {
                modalService.closeModal();
                $location.path('/post/' + data._id);
                scrollToElement(document.querySelector("#nav"));
            }
        );
    }

    vm.deletePost = function () {
        PostService.deletePost(PostService.postId).then(
            function () {
                PostsService.data.splice(PostService.index, 1);
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
        );
    }

    vm.popupDeletePostModal = function (index, postId, title) {
        PostService.title = title;
        PostService.postId = postId;
        PostService.postIndex = index;
        modalService.init({
            templateUrl: '/angularapp/user/user.deletepost.confirm.html',
            closeModal: ['.modal-close-btn', '.modal-bg', '.button-cancel'],
            controller: "PostController",
            controllerAs: "Post"
        })
    }
}

function PostSingleContentController(PostSingleDataService, Restangular, UserService) {

    var vm = this;
    vm.postData = PostSingleDataService;
    vm.postFavIsLoading = false;

    vm.postFav = function () {
        vm.postFavIsLoading = true;
        if (!UserService.isUserExist) {
            document.querySelector("#user-login").click();
            return;
        }
        Restangular.all("userdata").one(vm.postData.data._id).one("switchfav").get().then(
            function (data) {
                vm.postData.data.isFav = data;
                vm.postFavIsLoading = false;
            }, function () {
                vm.postFavIsLoading = false;
            }
        )
    }
}


