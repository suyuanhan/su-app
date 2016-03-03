angular.module('user')
    .factory('UserService', UserService)
    .factory('UserData', UserData)
    .factory('UserInfoData', UserInfoData)
    .factory("UserInfoService", UserInfoService)
    .factory("UserAllSubjects", UserAllSubjects)
    .factory("UserDeleteConfirmInfoService", UserDeleteConfirmInfoService);

function UserService(UserData, Restangular, $q, detectedPreventCloseService) {

    var userData;

    userData = new UserData();

    var UserState = Restangular.all("userstate");
    var UserData = Restangular.all("userdata");

    userData.userLogin = function (userInfo) {
        userData.isRefresh = true;
        detectedPreventCloseService.isRefresh = true;
        return UserState.one("login").post("", userInfo).then(
            function (response) {
                userData.data = response.userData;
                window.localStorage.setItem("token", response.token);
                userData.isUserExist = true;
                userData.isUserDataVaild = null;
                userData.isRefresh = false;
                detectedPreventCloseService.isRefresh = false;
            }, function (err) {
                userData.data = null;
                userData.isUserExist = false;
                userData.isUserDataVaild = false;
                userData.isRefresh = false;
                detectedPreventCloseService.isRefresh = false;
                return $q.reject()
            }
        )
    }

    userData.checkUserIsAlreadyLogin = function (token) {
        userData.isRefresh = true;
        return UserState.one("checkuser").post("", token).then(
            function (response) {
                userData.data = response;
                userData.isUserExist = true;
                userData.isRefresh = false;
            },
            function (error) {
                userData.data = null;
                userData.isUserExist = false;
                userData.isRefresh = false;
                return $q.reject()
            }
        )
    }

    userData.userSignout = function () {
        return UserState.one("signout").get().then(
            function () {
                userData.data = null;
                userData.isUserExist = false;
                window.localStorage.setItem("token", "");
                window.location.reload();
            }, function () {
                return $q.reject("signout error");
            }
        )
    }

    userData.userSignup = function (userInputData) {
        userData.isRefresh = true;
        detectedPreventCloseService.isRefresh = true;
        return UserData.post(userInputData).then(
            function (response) {
                userData.data = response.userData;
                userData.isUserExist = true;
                userData.isRefresh = false;
                window.localStorage.setItem("token", response.token);
                detectedPreventCloseService.isRefresh = false;
            },
            function (error) {
                userData.data = null;
                userData.isUserExist = false;
                userData.isRefresh = false;
                detectedPreventCloseService.isRefresh = false;
                return $q.reject("sign in error");
            }
        )
    }

    userData.userUpdate = function (userUpdateData) {
        userData.isRefresh = true;
        detectedPreventCloseService.isRefresh = true;
        var user = UserData.one(userData.data.username);
        user.description = userUpdateData.description;
        user.imgData = userUpdateData.imgData;
        return user.put().then(
            function (response) {
                userData.data = response.data;
                userData.isUserExist = true;
                userData.isRefresh = true;
                window.localStorage.setItem("token", response.token);
                window.location.reload();
            }, function (err) {
                userData.isRefresh = true;
                detectedPreventCloseService.isRefresh = false;
                return $q.reject("update failed");
            }
        );
    }

    userData.userCheckUnique = function () {
        return UserState.one("checkuserisunique").get().then(
            null, function () {
                return $q.reject
            }
        )
    }

    return userData;
}

function UserData() {
    function UserData() {
        this.data = this.data || {};
        this.isRefresh = this.isRefresh || true;
        this.isUserExist = this.isUserExist || false;
        this.isUserDataVaild = this.isUserDataVaild || null;
    }

    UserData.prototype.clearData = function () {
        this.data = {};
        this.isRefresh = false;
        this.isUserExist = false;
        window.localStorage.setItem("token", "");
    }

    return UserData;
}

function UserInfoData() {
    function UserInfoData() {
        this.data = this.data || {};
        this.isRefresh = this.isRefresh || true;
        this.isUserAuthorized = this.isUserAuthorized || false;
    }

    return UserInfoData;
}

function UserInfoService(BaseDataModel, Restangular, $q) {

    var userInfo;
    userInfo = new BaseDataModel();

    userInfo.getUserData = function (username) {
        userInfo.isRefresh = true;
        return Restangular.all("userdata").one(username).get().then(
            function (data) {
                userInfo.setData(data);
                userInfo.isRefresh = false;
            }, function () {
                userInfo.isRefresh = false;
                $q.reject("not find user");
            }
        )
    }

    return userInfo;
}

function UserAllSubjects(BaseDataModel, Restangular, $q, PostsService, CommentsService) {

    var userSubjectData;

    userSubjectData = new BaseDataModel();

    var UserData = Restangular.all("userdata");

    userSubjectData.getUserFav = function (username) {
        userSubjectData.isRefresh = true;
        return UserData.one(username).one("fav").get().then(
            function (data) {
                userSubjectData.setData(data)
                userSubjectData.isRefresh = false;
            }, function () {
                userSubjectData.clearData();
                userSubjectData.isRefresh = false;
                $q.reject("not find favs")
            }
        )
    }
    return userSubjectData;
}

function UserDeleteConfirmInfoService(BaseDataModel) {
    var userSubInfo;
    userSubInfo = new BaseDataModel();
    return userSubInfo;
}
