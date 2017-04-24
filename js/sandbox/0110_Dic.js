
/**
 * Dic: Ultra light kvazi dic/service locator. Nieco na styl pimplu.
 *
 * NOTE: referencie na construktory treba vzdy obalit do dalsieho callbacku...
 * (lebo tam vzdy typeof "function" bude true, teda by sa vzdy vykonal,
 * ale bez operatora new), konkretne:
 *     function X() {} // contructor
 *     var dic = new Dic();
 *     dic.set("x", function(dic) {return X});
 *     var instance = new (dic.get("x"))();
 *
 * NOTE2: vo vnutri callbackov je dic posielany ako parameter, teda vsetky
 * zavislosti normalne mozu "lazy kaskadovat"
 *
 * @todo: test (zatial testovane len zbezne)
 */
function Dic() {
    this._values  = {};
    this._shared  = {};
    this._results = {};
}

Dic.prototype = {

    _unset: function(key) {
        delete this._values[key];
        delete this._shared[key];
        delete this._results[key];
    },

    _defined: function(key, value) { // null value is ok
        return typeof key !== "undefined" && key !== null && typeof value !== "undefined";
    },

    set: function(key, value) {
        this._unset(key);
        (this._defined(key, value) && (this._values[key] = value));
        return this;
    },

    share: function(key, value) {
        this._unset(key);
        (this._defined(key, value) && (this._shared[key] = value));
        return this;
    },

    get: function(key, defaultValue) {

        // shared lookup
        if (typeof this._shared[key] !== "undefined") {
            if (typeof this._results[key] == "undefined") {
                this._results[key] = (typeof this._shared[key] == "function")
                                   ? this._shared[key](this) : this._shared[key];
            }
            return this._results[key];
        }

        // "regular" lookup
        if (typeof this._values[key] !== "undefined") {
            value = this._values[key];
            return (typeof value == "function") ? value(this) : value;
        }

        // fallback to default
        return defaultValue;
    },
}
