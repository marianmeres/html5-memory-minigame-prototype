var mm = {

    isArray: Array.isArray || function (o) {
        return Object.prototype.toString.call(o) == '[object Array]';
    },

    extend: function (child /*, parent, parent2...*/) {
        child = child || {};
        var parents = Array.prototype.slice.call(arguments, 1);
        for (var j = 0, l = parents.length; j < l; j++) {
            var parent = parents[j];
            for (var i in parent) {
                if (parent.hasOwnProperty(i)) {
                    child[i] = parent[i];
                }
            }
        }
        return child;
    },

    mixin: function () {
        return this.extend.apply({}, arguments);
    },

    extendDeep: function (child, parent) {
        child = child || {};
        for (var i in parent) {
            if (parent.hasOwnProperty(i)) {
                // pozor: typeof null == "object"
                if (null === parent[i] || typeof parent[i] != "object") {
                    child[i] = parent[i];
                } else if (parent[i] instanceof Date) {
                    child[i] = new Date(parent[i].getTime());
                } else { // recurse
                    child[i] = this.extendDeep(
                        this.isArray(parent[i]) ? [] : {}, parent[i]
                    );
                }
            }
        }
        return child;
    },

};
