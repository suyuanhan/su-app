angular.module('tags')
    .factory('TagsHomeService', TagsHomeService)
    .factory('TagsListAllService', TagsListAllService)

function TagsHomeService(BaseDataModel, Restangular, $q, PromisesService) {

    var tagsModel;

    tagsModel = new BaseDataModel();

    var TagsRest = Restangular.all("tagsdata");

    tagsModel.getLimitTagsData = function (config) {
        tagsModel.isRefresh = true;
        return TagsRest.getList(config).then(
            function (data) {
                tagsModel.setData(data);
            }, function () {
                tagsModel.isRefresh = false;
                $q.reject("not get limit tags");
            }
        )
    }

    return tagsModel;
}

function TagsListAllService(BaseDataModel, Restangular, $q, PromisesService) {

    var tagsModel;

    tagsModel = new BaseDataModel();

    var TagsRest = Restangular.all("tagsdata");

    tagsModel.getFullTagsData = function () {
        tagsModel.isRefresh = true;
        return TagsRest.getList().then(
            function (data) {
                var tagsData = filterArray(data)
                tagsData = reArrangeTagsData(tagsData);
                tagsModel.setData(tagsData);
                return tagsData;
            }, function () {
                tagsModel.isRefresh = false;
                $q.reject("not get tags");
            }
        )
    }

    function reArrangeTagsData(tagsData) {
        if (!tagsData.length) {
            return [];
        }
        var recordEmpty;
        var firstLetter, tagObjIndex;
        var firstLetterArr = [];
        var tagsArr = [];

        for (var i in tagsData) {
            if (tagsData[i].tagName === " ") {
                recordEmpty = {firstLetter: "空标签", tagArr: [{tagName: "", count: tagsData[i].publicCount}]}
                continue;
            }
            firstLetter = tagsData[i].tagName.substring(0, 1);
            tagObjIndex = firstLetterArr.indexOf(firstLetter);
            if (tagObjIndex === -1) {
                firstLetterArr.push(firstLetter);
                tagsArr.push({
                    firstLetter: firstLetter,
                    tagArr: [{tagName: tagsData[i].tagName, count: tagsData[i].publicCount}]
                });

            } else {
                tagsArr[tagObjIndex].tagArr.push({tagName: tagsData[i].tagName, count: tagsData[i].publicCount});
            }
        }
        if (recordEmpty) {
            tagsArr.push(recordEmpty);
        }
        return tagsArr;
    }

    function filterArray(data) {
        var arr = [];
        for (var i in data) {
            if (!isNaN(i)) {
                arr.push(data[i]);
            }
        }
        return arr;
    }

    return tagsModel;

}
