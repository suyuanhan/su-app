angular.module('post')
    .directive('tagsInput', tagsInput)
    .directive('popupCreatepostForm', popupCreatepostForm)
    .directive('popupModifyPanel', popupModifyPanel)
    .directive('popupUpdateModal', popupUpdateModal)

function tagsInput(detectedPreventCloseService) {
    return {
        restrict: "A",
        scope: {
            postTags: "=ngModel",
            disabled: "=ngDisabled",
            PostForm: "=tagsInput"
        },
        controller: function ($scope) {
            if (!$scope.postTags) {
                $scope.postTags = [];
            }
            $scope.removeTag = function (tagIndex) {
                if (!detectedPreventCloseService.isRefresh) {
                    $scope.postTags.splice(tagIndex, 1);
                }
            }
            $scope.addTag = function ($event) {
                if (detectedPreventCloseService.isRefresh) {
                    return;
                }
                if ($event.keyCode === 13 || $event.keyCode === 188) {
                    var inputValue = $scope.tagVal;
                    if (inputValue.indexOf(',') > -1) {
                        inputValue = inputValue.substr(0, inputValue.length - 1);
                    }
                    addTagFn(inputValue);
                }
            }
            $scope.$watch(function () {
                if ($scope.postTags) {
                    return $scope.postTags.length
                } else {
                    return -1;
                }
            }, function (newVal, oldVal) {
                if (newVal > 5) {
                    $scope.PostForm.tagsInput.$setValidity("tagsMaxLength", false);
                } else {
                    $scope.PostForm.tagsInput.$setValidity("tagsMaxLength", true);
                }
            })
            $scope.addTagClick = function () {
                addTagFn($scope.tagVal);
            }
            function addTagFn(inputValue) {
                if (!inputValue.trim()) {
                    return;
                }
                if ($scope.postTags.indexOf(inputValue) === -1) {
                    $scope.postTags.push(inputValue);
                    $scope.PostForm.tags = $scope.postTags;
                }
                $scope.tagVal = "";
            }
        },
        controllerAs: "tagsCtrl",
        templateUrl: '/angularapp/tags/tags.input.html'
    }
}

function popupCreatepostForm() {
    return {
        restrict: "A",
        controller: "PostController",
        link: function (scope, ele, attr, ctrl) {
            ele.bind('click', function () {
                ctrl.popupCreatePostModal();
            })
        }
    }
}

function popupModifyPanel(modalService) {
    return {
        restrict: "A",
        link: function (scope, ele, attr, ctrl) {
            ele.bind('click', function () {
                modalService.init({
                    templateUrl: '/angularapp/user/user.modify.info.html',
                    closeModal: ['.modal-close-btn', '.modal-bg', '.button-cancel'],
                })
            })
        }
    }
}

function popupUpdateModal() {
    return {
        restrict: "A",
        controller: "PostListController",
        link: function (scope, ele, attr, ctrl) {
            ele.bind('click', function () {
                ctrl.popupUpdatePostModal();

            })
        }
    }
}


