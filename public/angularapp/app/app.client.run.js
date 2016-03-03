angular.module('suApp')
    .run(runFn);

function runFn($rootScope, UserService, PostsService, PromisesService, $http, $templateCache) {

    $http.get('/angularapp/post/postlist.html', {cache: $templateCache})
    $http.get('/angularapp/tags/tags.showall.html', {cache: $templateCache})
    $http.get('/angularapp/post/postlist.html', {cache: $templateCache})
    $http.get('/angularapp/comment/comment.client.inpost.html', {cache: $templateCache})
    $http.get('/angularapp/user/user.info.html', {cache: $templateCache})
    $http.get('/angularapp/user/user.info.posts.html', {cache: $templateCache})
    $http.get('/angularapp/user/user.info.comments.html', {cache: $templateCache})
    $http.get('/angularapp/user/user.info.fav.html', {cache: $templateCache})
    $http.get("/angularapp/views/error.html", {cache: $templateCache})
    $http.get("/angularapp/views/error.html", {cache: $templateCache})
    $http.get('/angularapp/user/user.signup.html', {cache: $templateCache})
    $http.get('/angularapp/user/user.login.html', {cache: $templateCache})
    $http.get('/angularapp/user/user.deletepost.confirm.html', {cache: $templateCache})
    $http.get('/angularapp/post/post.creator.html', {cache: $templateCache})

    $http.get("/images/avatar.jpg", {cache: $templateCache})
    $http.get("/images/loading.gif", {cache: $templateCache})

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        var token = window.localStorage.getItem("token") ? window.localStorage.getItem("token") : ""
        var params = {
            token: token
        }
        UserService.checkUserIsAlreadyLogin(params);
        PromisesService.resetAllPromise();

    })

    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {

        var stateName = toState.name;
        var nextPageFn;

        if (stateName === "home") {
            nextPageFn = PostsService.getNextPage("postsdata");
        }
        if (stateName === "tagposts") {
            nextPageFn = PostsService.getNextPage("tagposts", toParams.tagname);
        }

        window.onscroll = function () {
            if (stateName == "home" || stateName == "tagposts") {
                if ((window.innerHeight + window.scrollY + 80) >= document.querySelector("#full-wrapper").offsetHeight) {

                    nextPageFn();
                }
            }
        };

    })
}