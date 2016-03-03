var scrollToElement = (function () {
    function findPos(ele, moreHeight) {
        var curtop = 0;

        if (ele && ele.offsetParent) {
            do {
                curtop += ele.offsetTop;
            } while (ele = ele.offsetParent);
        }
        if (moreHeight) {
            curtop += moreHeight
        }
        window.scroll(0, [curtop]);
    }

    return findPos
})()

if (!String.prototype.trim) {
    (function () {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function () {
            return this.replace(rtrim, '');
        };
    })();
}

