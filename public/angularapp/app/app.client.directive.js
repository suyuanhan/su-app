angular.module('suApp')
    .directive('toggleMenu', toggleMenu)
    .directive('disLoading', disLoading)

function toggleMenu($document, $timeout, $animate) {
    function setElementDisplay(element, hideClass) {
        return function (isDisplay) {
            if (isDisplay) {
                if (element.hasClass(hideClass)) {
                    element.removeClass(hideClass);
                }
            } else {
                if (!element.hasClass(hideClass)) {
                    element.addClass(hideClass);
                }
            }
        }
    }

    return {
        restrict: "A",
        scope: true,
        link: function (scope, ele, attr) {
            var hideClass = attr.hideMenuClass;
            var isClickable = true;
            var eventType = null;
            var visible = false;
            var elements = attr.toggleMenu.split(",");
            var btnEle = angular.element(document.querySelector(elements[0]))
            var menuEle = angular.element(document.querySelector(elements[1]))

            var setEleDisplay = setElementDisplay(menuEle, hideClass);
            setEleDisplay(visible);

            $document.on('touchstart click', function (event) {
                if (!isClickable) {
                    return;
                }
                //防止fire click
                if (eventType === null) {
                    eventType = event.type;
                } else if (eventType !== event.type) {
                    return;
                }

                if (btnEle[0] === event.target || btnEle[0].contains(event.target)) {
                    visible = !visible;
                    setEleDisplay(visible);
                    return;
                }

                if (menuEle[0].contains(event.target)) {
                    if (visible) {
                        isClickable = false;
                        $timeout(function () {
                            visible = !visible;
                            setEleDisplay(visible);
                            isClickable = true;
                        }, 150)
                    }
                    return;
                }
                if (visible) {
                    visible = !visible;
                    setEleDisplay(visible);
                }
            })

        }
    }
}

function disLoading() {
    return {
        restrict: "A",
        scope: true,
        template: '<div class="class"><img src="/images/loading.gif" width="{{ size }}" ><div ng-transclude></div></div>',
        transclude: true,
        replace: true,
        link: function (scope, ele, attr) {
            scope.class = attr.class;
            scope.showCondition = scope.$eval(attr.disLoading);
            scope.$watch(
                function () {
                    return scope.$eval(attr.disLoading);
                }, function (newVal, oldVal) {
                    ele.css('display', newVal ? "" : 'none');
                }
            )
            if (attr.size) {
                scope.size = attr.size;
            } else {
                scope.size = 40;
            }
        }

    }
}
