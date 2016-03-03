angular.module('user')
    .controller('UserController', UserController)
    .controller('UserInfoController', UserInfoController)
    .controller('UserSubjectController', UserSubjectController);

function UserController($scope,
                        UserService,
                        modalService,
                        md5) {

    var vm = this;

    UserService.isUserDataVaild = null;
    vm.userData = UserService;
    //for login
    vm.userFormData = {};

    //for signUp
    vm.passwordPattern = /^[a-zA-Z0-9,\.\/<>?;:'"`!@#$%^&*()\[\]{}_+=|\\-]+$/;
    vm.signupModel = {};
    vm.loginModel = {};

    vm.userForm = {};

    //for update
    vm.updateModel = {};
    vm.updateModel.uploadFileProcess = 0;
    vm.updateModel.userAvatar = "";

    vm.userAvatar = "";
    vm.updateForm = {};
    vm.isUserAvatarShow = true;

    vm.popupUserSignupModal = function () {
        modalService.closeDialog().then(function () {
            modalService.init({
                templateUrl: '/angularapp/user/user.signup.html',
                closeModal: ['.modal-close-btn', '.modal-bg', '.button-cancel']
            }).then(
                null, null,
                function (data) {
                }
            )
        })
    }

    vm.popupUserLoginModal = function () {
        modalService.init({
            templateUrl: '/angularapp/user/user.login.html',
            closeModal: ['.modal-close-btn', '.modal-bg'],
            closeDialog: ['.goSignup']
        }).then(
            function (data) {
                return modalService.init({
                    templateUrl: '/angularapp/user/user.signup.html',
                    closeModal: ['.modal-close-btn', '.modal-bg']
                })
            },
            function (data) {
            }
        )
    }

    vm.loginUser = function (loginForm) {

        if (!loginForm.username.$modelValue && loginForm.username.$untouched) {
            loginForm.username.$setValidity("empty", false);
        }
        if (!loginForm.password.$modelValue && loginForm.password.$untouched) {
            loginForm.password.$setValidity("empty", false);
        }
        if (loginForm.$valid) {
            var loginData = {
                username: vm.loginModel.username,
                password: md5.createHash(vm.loginModel.password)
            }
            UserService.userLogin(loginData).then(
                function () {
                    modalService.closeDialog().then(
                        function () {
                            modalService.init({
                                template: {
                                    content: "登录成功",
                                },
                                closeTime: 800
                            })
                            window.location.reload();
                        }
                    )
                }
            )
        }
    }

    vm.signUpUser = function (signupForm) {

        if (!signupForm.username.$viewValue && signupForm.username.$untouched) {
            signupForm.username.$setValidity('empty', false)
        }
        if (!signupForm.email.$viewValue && signupForm.email.$untouched) {
            signupForm.email.$setValidity('empty', false)
        }
        if (!signupForm.password.$viewValue && signupForm.password.$untouched) {
            signupForm.password.$setValidity('empty', false)
        }
        if (!signupForm.passwordRepeat.$viewValue && signupForm.passwordRepeat.$untouched) {
            signupForm.passwordRepeat.$setValidity('empty', false)
        }
        if (vm.signupModel.password !== vm.signupModel)

            if (!signupForm.$invalid && !signupForm.$pending) {
                showDialog();
            }

        function showDialog() {
            var userData = {
                username: vm.signupModel.username,
                email: vm.signupModel.email,
                password: md5.createHash(vm.signupModel.password)
            }
            UserService.userSignup(userData).then(
                function (data) {
                    $scope.$destroy();
                    modalService.closeDialog()
                        .then(
                            function (msg) {
                                return modalService.init({
                                    template: {
                                        content: "注册成功",
                                    },
                                    closeTime: 800
                                })
                            })
                },
                function (data) {
                    modalService.closeDialog().then(
                        function (data) {
                            $scope.$destroy();
                            return modalService.init({
                                template: {
                                    content: "注册失败",
                                },
                                closeTime: 800
                            })
                        })
                }
            )
        }

    }

    vm.signOutUser = function () {
        UserService.userSignout();
    }

    vm.updateUser = function (form) {

        var isModifyDescription = vm.updateModel.description !== vm.userData.data.description;
        if (form.$valid && (isModifyDescription || !vm.isUserAvatarShow)) {
            config = {
                description: vm.updateModel.description,
                imgData: vm.isUserAvatarShow ? "" : vm.myCroppedImage
            }
            UserService.userUpdate(config).then(
                function () {
                    window.location.reload();
                }, function () {
                }
            );
        } else {
            modalService.closeModal();
        }
    }

    vm.initUpdateData = function (form) {
        vm.updateModel.description = UserService.data.description;
        vm.userAvatar = UserService.data.avatar;
        vm.updateForm = form;
    }

    //更新头像
    var eventType = null;
    var isFinish = false;
    vm.selectFile = function (e) {
        if (!isFinish) {
            document.querySelector("#fileInput").click();
            isFinish = true;
        }
    }

    vm.myImage = '';
    vm.myCroppedImage = "";

    var handleFileSelect = function (evt) {
        var fileType;
        var file = evt.currentTarget.files[0];

        if (file && file.size > 500000) {
            vm.updateForm.file.$setValidity("maxSize", false)
            vm.myCroppedImage = "";
            vm.isUserAvatarShow = true;
            isFinish = false;
        } else {
            vm.updateForm.file.$setValidity("maxSize", true)
            fileType = file.name.split(".");
            fileType = fileType[fileType.length - 1];
        }
        if (fileType && fileType !== "jpeg" && fileType !== "png" && fileType !== "jpg") {
            vm.updateForm.file.$setValidity("fileType", false)
            vm.isUserAvatarShow = true;
            vm.myCroppedImage = "";
            isFinish = false;
        } else {
            vm.updateForm.file.$setValidity("fileType", true);
        }

        if (vm.updateForm.file.$valid) {
            vm.isUserAvatarShow = false;
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    vm.myImage = evt.target.result;
                    isFinish = false;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);

}

function UserInfoController(UserInfoService) {
    var vm = this;
    vm.userData = UserInfoService;
}

function UserSubjectController(UserAllSubjects,
                               UserService,
                               $stateParams) {

    var vm = this;
    vm.subjectData = UserAllSubjects;

    vm.checkIsAuthority = function () {
        return UserService.data ? UserService.data.username === $stateParams.username : false;
    }

}

