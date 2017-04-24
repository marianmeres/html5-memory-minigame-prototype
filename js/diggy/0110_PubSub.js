/**
 * PubSub ultra light (credit jake gordon)
 */
function PubSub () {
    this.subscribers = {};
}

PubSub.prototype = {

    subscribe: function(event, callback, target) {
        this.subscribers[event] = this.subscribers[event] || [];
        this.subscribers[event].push({callback: callback, target: target});
    },

    publish: function(event) {
        if (this.subscribers && this.subscribers[event]) {
            var subs = this.subscribers[event];
            var args = [].slice.call(arguments, 1);
            var n, sub;
            for(n = 0; n < subs.length; ++n) {
                sub = subs[n];
                sub.callback.apply(sub.target, args);
            }
        }
    }
}