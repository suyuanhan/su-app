angular.module('post')
    .factory('PostsService', PostsService)
    .factory('PostSingleDataService', PostSingleDataService)
    .factory('PostService', PostService)

function PostsService(BaseDataModel,
                      $q,
                      Restangular,
                      PromisesService) {

    var postsModel, limit, skip;
    postsModel = new BaseDataModel();
    postsModel.isEndPosts = false;

    postsModel.clearData = function () {
        this.data = null;
        this.isRefresh = false;
        this.isEndPosts = false;
    }

    postsModel.getParams = getInitParams;
    postsModel.getNextPage = getNextPage;

    var PostRest = Restangular.all("postsdata")

    postsModel.getAllPostsData = function (params) {
        postsModel.isRefresh = true;
        var defer = $q.defer();
        PromisesService.addPromise(defer);
        PostRest.withHttpConfig({timeout: defer.promise}).getList(params).then(
            function (data) {
                postsModel.setData(data);
            }, function (err) {
                postsModel.resetData();
            }
        )
    }

    //获取与相关标签的文章列表
    var TagRest = Restangular.one("tagposts")
    postsModel.getTagPosts = function (tagname, params) {
        var defer = $q.defer();
        PromisesService.addPromise(defer);
        postsModel.isRefresh = true;
        TagRest.withHttpConfig({timeout: defer.promise}).getList(tagname, params).then(
            function (data) {
                postsModel.setData(data)
                if (data.length < limit) {
                    postsModel.isEndPosts = true;
                }
            }, function (err) {
                postsModel.resetData();
                postsModel.isRefresh = false;
            }
        )
    }

    //获取用户相关文章列表
    postsModel.getUserPosts = function (username) {
        postsModel.clearData();
        postsModel.isRefresh = true;
        Restangular.all("userdata").one(username).one("posts").getList().then(
            function (data) {
                postsModel.setData(data);
            }, function (err) {
                $q.reject("no data");
            }
        )
    }

    return postsModel;

    //根据屏幕高度获取当前显示文章条数
    function getInitParams() {
        var winHeight = screen.height;
        var itemHeight = 130;
        limit = Math.round(winHeight / itemHeight);
        skip = 0;
        return {"limit": limit, "skip": skip}
    }

    //获取滚动到下一页文章列表
    function getNextPage(url, urlParams) {

        var nextPageDefer = $q.defer();
        PromisesService.addPromise(nextPageDefer);
        return function () {
            if (!postsModel.isRefresh && !postsModel.isEndPosts) {
                skip += limit;
                postsModel.isRefresh = true;
                Restangular.one(url).withHttpConfig({timeout: nextPageDefer.promise}).getList(urlParams, {
                    limit: limit,
                    skip: skip
                }).then(
                    function (data) {
                        if (data.length < limit) {
                            postsModel.isEndPosts = true;
                        }
                        postsModel.data = postsModel.data.concat(data);
                        postsModel.isRefresh = false;
                    }, function (err) {
                        postsModel.isRefresh = false;
                        $q.reject("next error");
                    }
                )
            }
        }
    }
}

//用于获取单个文章服务
function PostSingleDataService(BaseDataModel, Restangular, PromisesService, $q) {

    var postModel;
    postModel = new BaseDataModel();

    postModel.getPostData = function (id) {
        postModel.isRefresh = true;
        var defer = $q.defer();
        PromisesService.addPromise(defer);
        Restangular.one("postsdata", id).get().then(
            function (data) {
                postModel.setData(data)
            }, function (err) {
                postModel.resetData();
            }
        )
    };

    return postModel;
}

//文章CRUD操作服务
function PostService(BaseDataModel, Restangular, $q, detectedPreventCloseService) {

    var postDataModel;

    postDataModel = new BaseDataModel();

    var postRest = Restangular.all("postsdata")

    postDataModel.getPostData = function (postId) {
        detectedPreventCloseService.isRefresh = true;
        postDataModel.clearData();
        postDataModel.isRefresh = true;
        return postRest.one(postId).get().then(
            function (data) {
                postDataModel.setData(data);
                detectedPreventCloseService.isRefresh = false;
            }, function (err) {
                postDataModel.clearData();
                detectedPreventCloseService.isRefresh = false;
                return $q.reject("not get post data");
            }
        )
    }

    postDataModel.postPostData = function (data) {
        detectedPreventCloseService.isRefresh = true;
        postDataModel.isRefresh = true;
        return postRest.post(data).then(
            function (responseData) {
                postDataModel.isRefresh = false;
                detectedPreventCloseService.isRefresh = false;
                return responseData;
            }, function (err) {
                detectedPreventCloseService.isRefresh = false;
                postDataModel.isRefresh = false;
                return $q.reject("not post post");
            })
    }

    postDataModel.updatePostData = function (postId, data) {
        detectedPreventCloseService.isRefresh = true;
        this.isRefresh = true;
        var post = postRest.one(postId);
        post.content = data.content;
        post.tags = data.tags;
        post.postprivacy = data.postprivacy;
        return post.put().then(
            function (response) {
                postDataModel.isRefresh = false;
                detectedPreventCloseService.isRefresh = false;
                return response;
            }, function (err) {
                postDataModel.isRefresh = false;
                detectedPreventCloseService.isRefresh = false;
                return $q.reject("faild update post");
            }
        )
    }

    postDataModel.deletePost = function (postId) {
        detectedPreventCloseService.isRefresh = true;
        this.isRefresh = true;
        return postRest.one(postId).remove().then(
            function () {
                detectedPreventCloseService.isRefresh = false;
                postDataModel.isRefresh = false;
            }, function () {
                detectedPreventCloseService.isRefresh = false;
                postDataModel.isRefresh = false;
                return $q.reject("faild to remove post");
            }
        )
    }

    return postDataModel;
}

