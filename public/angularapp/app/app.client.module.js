angular.module('suApp', [
    'ui.router',
    'post',
    'tags',
    'user',
    'modalBuilder',
    'comment',
    'ngAnimate',
    'ngMessages',
    'ngTouch',
    'ngResource',
    'ngImgCrop',
    'restangular',
    'angular-md5'
]);

angular.element(document).ready(function () {
    angular.bootstrap(document, ['suApp']);
});

