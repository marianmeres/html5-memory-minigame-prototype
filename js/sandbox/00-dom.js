// @credit Jake Gordon http://codeincomplete.com
var dom = {

    get: function(id) {
        return ((id instanceof HTMLElement) || (id === document))
               ? id : document.getElementById(id);
    },

    set: function(id, html) {
        dom.get(id).innerHTML = html;
    },

    on: function(ele, type, fn, capture) {
        dom.get(ele).addEventListener(type, fn, capture);
    },

    off: function(ele, type, fn, capture) {
        dom.get(ele).removeEventListener(type, fn, capture);
    },

    show: function(ele, type) {
        dom.get(ele).style.display = (type || 'block');
    },

    hide: function(ele) {
        dom.get(ele).style.display = 'none';
    },

    blur: function(ev) {
        ev.target.blur();
    },

    addClassName: function(ele, name) {
        dom.toggleClassName(ele, name, true);
    },

    removeClassName: function(ele, name) {
        dom.toggleClassName(ele, name, false);
    },

    toggleClassName: function(ele, name, on) {
        ele = dom.get(ele);
        var classes = ele.className.split(' ');
        var n = classes.indexOf(name);
        on = (typeof on == 'undefined') ? (n < 0) : on;

        if (on && (n < 0)) {
            classes.push(name);
        } else if (!on && (n >= 0)) {
            classes.splice(n, 1);
        }

        ele.className = classes.join(' ');
    }

};