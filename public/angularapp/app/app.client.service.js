angular.module('suApp')
    .factory("BaseDataModel", BaseDataModel)
    .factory("HttpInterceptor", HttpInterceptor)
    .factory('PromisesService', PromisesService)

function BaseDataModel() {
    function BaseDataModel() {
        this.data = this.data || null;
        this.isRefresh = this.isRefresh || false;
        this.isTimeout = this.isTimeout || false;
    }

    BaseDataModel.prototype.setData = function (data) {
        this.data = data;
        this.isRefresh = false;
    }

    BaseDataModel.prototype.resetData = function () {
        this.data = null;
        this.isRefresh = false;
    }


    BaseDataModel.prototype.clearData = function () {
        this.data = null;
        this.isRefresh = false;
        this.isTimeout = false;
    }

    return BaseDataModel;
}

function HttpInterceptor($q, $injector) {
    var interceptor = {
        request: function (config) {
            var token = window.localStorage.getItem("token") ? window.localStorage.getItem("token") : "";
            config.headers.authorization = token;
            return config;
        },
        response: function (result) {
            return result;
        },
        responseError: function (error) {
            var modal = $injector.get('modalService');
            var userService = $injector.get('UserService');

            if (error.status === 404) {
                $injector.get('$state').go('404');
                return $q.reject(error);
            }

            if (error.status === 401) {
                userService.clearData();
                modal.closeModal().then(
                    function () {
                    },
                    function () {
                        document.querySelector("#user-login").click()
                    }
                )
            }

            if (error.status >= 500) {
                var modal = $injector.get('modalService');
                var userService = $injector.get('UserService');
                userService.clearData();
                modal.closeModal().then(
                    function () {
                    },
                    function () {
                        modal.init({
                            template: {
                                content: "服务器错误,请尝试刷新",
                            },
                            closeTime: 1000
                        })
                    }
                )
            }
            return $q.reject(error);
        }
    }
    return interceptor;
}

function PromisesService($q) {

    function Promises() {
        this.promises = this.promises || [];
    }

    Promises.prototype.addPromise = function (obj) {
        this.promises.push(obj);
    }
    Promises.prototype.getPromise = function (index) {
        return this.promises[index];
    }
    Promises.prototype.resetAllPromise = function () {
        for (var i in this.promises) {
            this.promises[i].resolve();
            this.promises[i] = $q.defer();
        }
    }

    Promises.prototype.clear = function () {
        this.promises = [];
    }

    return new Promises();
}

