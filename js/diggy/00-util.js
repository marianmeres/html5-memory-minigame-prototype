var util = {

    now: function() {
        return (new Date()).getTime();
    },

    toInt: function(obj, def) {
        if (obj !== null) {
            var x = parseInt(obj, 10);
            if (!isNaN(x))  {
                return x;
            }
        }
        return util.toInt(def, 0);
    },

    toFloat: function(obj, def) {
        if (obj !== null) {
            var x = parseFloat(obj);
            if (!isNaN(x)) {
                return x;
            }
        }
        return util.toFloat(def, 0.0);
    },

    limit: function(value, min, max) {
        return Math.max(min, Math.min(value, max));
    },

    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomChoice: function(options) {
        // return options[util.randomInt(0, options.length-1)];
        return options[Math.floor(Math.random() * options.length)]
    }
};