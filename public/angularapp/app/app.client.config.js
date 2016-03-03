angular.module('suApp').config(configFn);

function configFn($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider, $provide) {
    $locationProvider.html5Mode(true);

    $provide.decorator('$state', function ($delegate, $stateParams) {
        $delegate.forceReload = function () {
            return $delegate.go($delegate.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });
        };
        return $delegate;
    });

    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: '/angularapp/post/postlist.html',
            resolve: {
                PostsService: function (PostsService) {
                    PostsService.clearData();
                    PostsService.getAllPostsData(PostsService.getParams());
                },
                TagsHomeService: function (TagsHomeService) {
                    TagsHomeService.clearData();
                    TagsHomeService.getLimitTagsData({limit: 5});
                }
            }
        })
        .state("tags", {
                url: "/tags",
                templateUrl: '/angularapp/tags/tags.showall.html',
                resolve: {
                    TagsListAllService: function (TagsListAllService) {
                        TagsListAllService.clearData();
                        TagsListAllService.getFullTagsData();
                    }
                }
            }
        )
        .state("tagposts", {
            url: "/tags/:tagname",
            templateUrl: '/angularapp/post/postlist.html',
            resolve: {
                PostsService: function (PostsService, $stateParams) {
                    PostsService.clearData();
                    PostsService.getTagPosts($stateParams.tagname, PostsService.getParams());
                }
            }
        })
        .state('post', {
            abstract: true,
            url: "/post/:postId",
            templateUrl: '/angularapp/post/post.showcontent.html',
            resolve: {
                postId: ['$stateParams', function ($stateParams) {
                    return $stateParams.postId;
                }],
                PostSingleDataService: function (PostSingleDataService, $stateParams) {
                    PostSingleDataService.clearData();
                    PostSingleDataService.getPostData($stateParams.postId);
                },
            }
        })
        .state('post.comments', {
            url: "",
            views: {
                "comments": {
                    templateUrl: '/angularapp/comment/comment.client.inpost.html',
                    controller: "CommentsController",
                    resolve: {
                        CommentsService: function (CommentsService, $stateParams) {
                            CommentsService.getCommentsByPostId($stateParams.postId);
                        }
                    }
                }
            }
        })
        .state('user', {
            abstract: true,
            url: "/user/:username",
            templateUrl: '/angularapp/user/user.info.html',
            resolve: {
                UserInfoService: function (UserInfoService, $stateParams) {
                    UserInfoService.getUserData($stateParams.username);
                }
            }
        })
        .state('user.posts', {
            url: "",
            templateUrl: '/angularapp/user/user.info.posts.html',
            resolve: {
                PostsService: function (PostsService, $stateParams) {
                    PostsService.getUserPosts($stateParams.username);
                }
            }
        })
        .state('user.comments', {
            url: "/comments",
            templateUrl: '/angularapp/user/user.info.comments.html',
            resolve: {
                CommentsService: function (CommentsService, $stateParams) {
                    CommentsService.getUserComments($stateParams.username);
                }
            }
        })
        .state('user.fav', {
            url: "/fav",
            templateUrl: '/angularapp/user/user.info.fav.html',
            resolve: {
                UserAllSubjects: function (UserAllSubjects, $stateParams) {
                    UserAllSubjects.clearData();
                    UserAllSubjects.getUserFav($stateParams.username);
                }
            }
        })
        .state("404", {
            templateUrl: "/angularapp/views/error.html"
        });

    $httpProvider.interceptors.push('HttpInterceptor');

    $urlRouterProvider
        .otherwise(function ($injector) {
            $injector.get("$state").go("404");
        });
}