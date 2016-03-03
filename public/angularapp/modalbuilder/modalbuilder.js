angular.module('modalBuilder', []);
angular.module('modalBuilder').factory('modalService', modalService)
angular.module('modalBuilder').factory('detectedPreventCloseService', detectedPreventCloseService)

function detectedPreventCloseService(BaseDataModel) {
    var detectedData = new BaseDataModel;
    return detectedData;
}

function modalService($q, $animate, $rootScope, $document, $timeout, $templateRequest, $compile, $controller, detectedPreventCloseService) {
    var modalBgTemplate = '<div class="modal-bg"></div>';
    var modalTransparentBg = '<div class="modal-trans-bg"></div>'
    var isDialogBuilded = false, isBgBuilded = false, isBgClickable = true, dialogTemplate = "", isAnimating = false;
    var modalBgClass = '.modal-bg', dialogClass = '.modal-content', defaultCloseBtn = '.modal-close-btn';

    function modalBuilder() {
        //var bodyEle = $document.find('body');
        //var modalBgEle, modalDialogEle;
        var scope, eleCompiled;
        //初始化modalBuilder
        var self = this;

        self.init = function (options) {
            if (isAnimating) {
                return;
            }
            var modalDefer = $q.defer();
            scope = $rootScope.$new();
            getTemplate(options).then(
                function (dialogTemplate) {
                    $q.all([buildModalBg(), buildDialog(dialogTemplate)])
                        .then(function (data) {
                            var modalEle = angular.element(document.querySelector('.modal-bg'));

                            setCloseModalEle(options.closeModal, modalBgClass, function () {
                                isBgBuilded = false;
                                isDialogBuilded = false;
                                scope.$destroy();
                                modalDefer.reject('modalClose');
                            });

                            setCloseModalEle(options.closeDialog, dialogClass, function () {
                                isDialogBuilded = false;
                                modalDefer.resolve('dialogClose');
                            });
                            if (options.closeTime) {
                                $timeout(function () {
                                    self.closeModal(modalDefer);
                                }, options.closeTime);
                            }
                            modalDefer.notify('notify')

                        })
                },
                function (err) {
                })

            return modalDefer.promise;

            function buildModalBg() {
                var defer = $q.defer();
                if (isBgBuilded === false) {
                    isAnimating = true;
                    var modalBgEle = angular.element(modalBgTemplate);
                    var modalTransBg = angular.element(modalTransparentBg);
                    var bodyEle = $document.find('body');
                    modalTransBg.css('height', document.documentElement.scrollHeight + 'px')
                    bodyEle.append(modalBgEle)

                    $animate.enter(modalTransBg, bodyEle).then(
                        function () {
                            isAnimating = false;
                            defer.resolve('finishEnter');
                        }
                    )
                    isBgBuilded = true;
                } else {
                    defer.resolve('Already builded');
                }
                return defer.promise;
            };

            function buildDialog(template) {
                var defer = $q.defer();
                if (!isDialogBuilded) {
                    isAnimating = true;
                    var modalDialogEle = angular.element(template);
                    var modalBgEle = angular.element(document.querySelector('.modal-bg'));

                    var mycon;
                    $timeout(function () {
                        eleCompiled = $compile(modalBgEle)(scope);
                    })
                    var locals = {
                        $scope: scope,
                        $element: eleCompiled
                    }
                    if (options.controller) {
                        mycon = $controller(options.controller, locals);
                    }
                    if (options.controllerAs) {
                        scope[options.controllerAs] = mycon;
                    }

                    scrollToElement(modalDialogEle, -50);


                    $animate.enter(modalDialogEle, modalBgEle).then(
                        function () {
                            isAnimating = false;
                            isDialogBuilded = true;
                            defer.resolve('dialogBuilded');
                        }
                    )
                }
                return defer.promise;
            };

            function setCloseModalEle(classArrs, removePart, callback) {
                if (!classArrs) {
                    return;
                }
                var removeTransBg;
                var removeEle = angular.element(document.querySelector(removePart));
                if (removePart === modalBgClass) {
                    removeTransBg = angular.element(document.querySelector('.modal-trans-bg'));
                }
                angular.forEach(classArrs, function (className) {
                    var closeEle = angular.element(document.querySelector(className));
                    closeEle.bind('click', function (e) {
                        if (angular.element(e.target).hasClass(className.substr(1)) && !isAnimating && !detectedPreventCloseService.isRefresh) {
                            scope.$apply(function () {
                                if (removeTransBg) {
                                    $animate.addClass(removeTransBg, "fade").then(function () {
                                        removeTransBg.remove();
                                    });
                                }
                                $animate.addClass(removeEle, 'fade').then(function () {
                                    isAnimating = false;
                                    removeEle.remove();
                                    callback();
                                })
                            })
                        }
                    })
                })
            }

            //处理template
            //template属性包括:title,hitIcon,content
            //默认modal:'modal-bg',closeModal:['modal-bg']
            //closeDialog参数需要使用的和closeModal需要使用class
            //或者templateUrl
            function getTemplate(options) {
                dialogTemplate = "";
                var defer = $q.defer();
                if (options.template) {
                    dialogTemplate += '<div class="modal-content post-radius">';
                    var tempConfig = options.template;
                    if (tempConfig.title) {
                        dialogTemplate += '<div class="modal-header"><button class="modal-close-btn" type="button">×</button><h4>';
                        dialogTemplate += tempConfig.title;
                        dialogTemplate += '</h4></div>';
                    }
                    dialogTemplate += '<div class="modal-body">';
                    if (tempConfig.hintIcon) {
                        dialogTemplate += '<img src="';
                        dialogTemplate += tempConfig.hintIcon + '"/>';
                    }
                    if (tempConfig.content) {
                        dialogTemplate += '<span>';
                        dialogTemplate += tempConfig.content + '</span>';
                    }
                    dialogTemplate += '</div></div>';
                    defer.resolve(dialogTemplate);
                } else if (options.templateUrl) {
                    $templateRequest(options.templateUrl, true).then(
                        function (template) {
                            defer.resolve(template)
                        },
                        function (err) {
                            defer.reject(err);
                        }
                    )
                } else {
                    defer.reject('no template found');
                }
                return defer.promise;
            };
        }

        self.closeDialog = function () {
            var modalDefer = $q.defer();
            if (isDialogBuilded) {
                isAnimating = true;
                var removeEle = angular.element(document.querySelector(dialogClass));
                var modalEle = angular.element(document.querySelector(modalBgClass));
                removeEle.off('click');
                modalEle.off("click");
                $animate.addClass(removeEle, 'fade').then(function () {
                    isDialogBuilded = false;
                    removeEle.remove();
                    isAnimating = false;
                    modalDefer.resolve('closeDialog kkk');
                })
            } else {
                modalDefer.resolve('closeDialog kkk');
            }
            return modalDefer.promise;
        }

        self.closeModal = function (modalDefer) {
            var defer, removeEle, removeBg;
            defer = $q.defer();
            if (isBgBuilded) {
                isAnimating = true;
                removeEle = angular.element(document.querySelector(modalBgClass));
                removeBg = angular.element(document.querySelector(".modal-trans-bg"));
                $animate.addClass(removeBg, "fade").then(function () {
                    removeBg.remove();
                })
                $animate.addClass(removeEle, 'fade').then(function () {
                    isBgBuilded = false;
                    isDialogBuilded = false;
                    removeEle.remove();
                    scope.$destroy();
                    isAnimating = false;
                    defer.reject('closeModal');
                })
            } else {
                defer.reject("closeModal");
            }
            return defer.promise;
        }
    }

    return new modalBuilder();
}
