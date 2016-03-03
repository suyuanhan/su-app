angular.module('user')
    .directive('checkMaxLength', checkMaxLength)
    .directive('checkRepeat', checkRepeat)
    .directive('checkUnique', checkUnique)
    .directive('popupSignupModal', popupSignupModal)
    .directive('checkUserRecord', checkUserRecord)
    .directive('checkInput', checkInput)
    .directive('checkPattern', checkPattern)
    .directive('popupLoginModal', popupLoginModal)
    .directive('checkInputFile', checkInputFile)
    .directive('triggerElementAction', triggerElementAction);

function checkMaxLength() {

    var getStrLength = function (str) {
        var strLength = 0;
        for (var i = 0; i < str.length; i++) {
            strLength += str.charCodeAt(i) > 255 ? 2 : 1;
        }
        return strLength;
    }

    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, ele, attrs, model) {
            var maxLength = parseInt(attrs.checkMaxLength);
            scope.$watch(function () {
                return model.$viewValue;
            }, function (newVal, oldVal) {
                if (newVal) {
                    if (getStrLength(newVal) > maxLength) {
                        model.$setValidity('maxLength', false);
                    } else {
                        model.$setValidity('maxLength', true);
                    }
                }
            })
        }
    }
}

function checkRepeat() {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, ele, attr, model) {
            var attrsValues = attr.checkRepeat.split(",");
            scope.$watch(function () {
                var pwdRepeat = scope.$eval(attrsValues[0]).$viewValue;
                var pwd = scope.$eval(attrsValues[1]).$viewValue;
                if (pwdRepeat === pwd) {
                    return true;
                } else {
                    return false;
                }
            }, function (newVal, oldVal) {
                if (newVal) {
                    model.$setValidity('repeat', true);
                } else {
                    model.$setValidity('repeat', false);
                }
            })
        }
    }
}

function checkUnique($q, Restangular) {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, ele, attrs, model) {
            var params = attrs.checkUnique;

            model.$asyncValidators[params] = function (modalVal, viewVal) {
                if (model.$isEmpty(modalVal)) {
                    return $q.when();
                }
                return Restangular.all("check").one(params).one(viewVal).get().then(
                    function () {
                        model.$setValidity('isUnique', true);
                    },
                    function () {
                        model.$setValidity('isUnique', false);
                        $q.reject("")
                    }
                )
            }
        }
    }
}

function popupSignupModal() {

    return {
        restrict: "A",
        controller: "UserController",
        link: function (scope, ele, attr, ctrl) {
            ele.bind('click', function () {
                ctrl.popupUserSignupModal();
            })
        }
    }
}

function popupLoginModal() {

    return {
        restrict: "A",
        controller: "UserController",
        link: function (scope, ele, attr, ctrl) {
            ele.bind('click', function () {
                ctrl.popupUserLoginModal();
            })
        }
    }
}

function checkUserRecord(UserService, UserData) {
    return {
        restrict: "A",
        link: function (scope, ele, attr, ctrl) {
            checkLogin();

            function checkLogin() {
                UserService.checkUserIsAlreadyLogin().then(
                    function (data) {
                        UserData.data = data.data;
                        UserData.isRefresh = false;
                        UserData.isUserExist = true;
                        /*UserService.isUserExist = true;
                         UserService.userData = data;*/
                    },
                    function (data) {
                        UserData.isUserExist = false;
                        UserData.isRefresh = false;
                        /*UserService.isUserExist = false;
                         UserService.userData = {};*/
                    })
            }

        }
    }
}

function checkInput() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, ele, attr, model) {
            ele.bind('blur', function () {
                if (model.$viewValue) {
                    model.$setValidity('empty', true);
                    scope.$apply();
                } else {
                    model.$setValidity('empty', false);
                    scope.$apply();
                }
            })
        }
    }
}

function checkPattern() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, ele, attr, model) {
            var reg;
            var match = attr.checkPattern.match(new RegExp('^/(.*?)/([gimy]*)$'))
            scope.$watch(function () {
                return model.$viewValue
            }, function (newVal, oldVal) {
                if (newVal) {
                    reg = new RegExp(match[1], match[2]);
                    if (reg.test(newVal)) {
                        model.$setValidity('pattern', false);
                    } else {
                        model.$setValidity('pattern', true);
                    }
                }
            })
        }
    }
}

function checkInputFile() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, ele, attr, model) {
            ele.on("change", function () {
                if (ele[0].files[0]) {
                    // model.$modelValue = ele[0].files[0];
                    scope.User.updateModel.userAvatar = ele[0].files[0];
                    scope.$apply();
                }
            })
        }
    }
}

function triggerElementAction() {
    return {
        link: function (scope, ele, attr) {
            var id = attr.triggerElementAction;
            ele.on('click', function () {
                document.querySelector(id).click();
                //location.href = link;
            })
        }
    }
}
