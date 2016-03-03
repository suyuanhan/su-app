angular.module('tags')
    .controller('TagsHomeController', TagsHomeController)
    .controller('TagsListAllController', TagsListAllController);

function TagsHomeController(TagsHomeService, $state, $stateParams) {
    var vm = this;
    vm.tagsData = TagsHomeService;
    vm.stateName = $state.current.name;
    vm.stateTagName = $stateParams.tagname;
}

function TagsListAllController(TagsListAllService) {
    var vm = this;
    vm.tagsData = TagsListAllService;
}

