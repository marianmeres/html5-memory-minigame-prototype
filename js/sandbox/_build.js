/*cached:eb530f.js*/

// polyfills and stuff

//
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}


window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function(callback, element) {
            return window.setTimeout(function(){
                callback(Date.now());
            }, 1000 / 60);
        };
})();

window.cancelRequestAnimationFrame = (function() {
    return window.cancelRequestAnimationFrame
        || window.webkitCancelRequestAnimationFrame
        || window.mozCancelRequestAnimationFrame
        || window.oCancelRequestAnimationFrame
        || window.msCancelRequestAnimationFrame
        || window.clearTimeout;
})();

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
        //return Math.round(util.interpolate(min, max, Math.random()));
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomChoice: function(options) {
        return options[util.randomInt(0, options.length-1)];
    }
};

var sandbox = (function (window) {

    /**
     * Hlavny loop. Implementuje "fixed timestep":
     * http://gafferongames.com/game-physics/fix-your-timestep/
     */
    function cycle (game, renderer, stats) {

        // make sure to loop at first run
        game.cycle = true;

        var now, last = util.now(), dt = 0, gdt = 0; // , rdt = 0

        var $spinner = dom.get("spinner"), $fps = dom.get("fps"), spinner = new Spinner();

        function frame() {
            now = Date.now();

            // using requestAnimationFrame have to be able to handle large
            // delta's caused when it 'hibernates' in a background or non-visible tab
            dt = Math.min(1, (now - last) / 1000);

            // http://gafferongames.com/game-physics/fix-your-timestep/
            // http://codeincomplete.com/
            gdt = gdt + dt;
            while (gdt > game.step) {
                gdt = gdt - game.step;
                game.update();
                (stats && stats.update("app"));
            }

            //
            renderer.update();
            (stats && stats.update("renderer"));

            //
            last = now;

            // unless we have not stopped, continue looping
            if (game.cycle) {
                // passing the canvas element as the second argument means only
                // the currently visible canvases get updated. (WebKit-specific though).
                requestAnimationFrame(frame, renderer.canvas);
            }

            // quick-n-dirty fps stats debug
            $spinner.innerHTML = spinner.ping(3);
            $fps.innerHTML = "fps[g:" + stats.data.app.fps + ",r:" + stats.data.renderer.fps + "]";;
        }

        frame(); // start the loop
    }


    function prx(val, useConsole) {
        var method = useConsole ? console.log : alert;
        method(JSON.stringify(val));
    }

/**
 * Taky maly port zakladnej functionality z Animator.js (Copyright Bernard Sumption)
 *
 * Riesi iba bazalnu vec, a to progres stavu od 0 do 1. Interne naraba s casom,
 * nie s frame-ami. Nema vlastny (setTimeout/animFrame) loop, updatovana musi byt
 * manualne via iny loop.
 *
 * @dependency mm
 */
function Animation(prefs) {
    this.reset().initSubjects().init(prefs);
    (this.options.autoPlay && this.play());
}

Animation.prototype = {

    init: function(prefs) {
        var that = this;
        prefs = prefs || {};

        if (typeof prefs.subjects != "undefined") {
            if (mm.isArray(prefs.subjects)) {
                prefs.subjects.forEach(function (s) {
                    that.addSubject(s);
                });
            }
            delete prefs.subjects;
        }

        this.options = mm.extend({
            duration:   1000, // in miliseconds
            onUpdate:   function(){},
            onComplete: function(){},
            transition: Animation.tx.linear,
            debug:      false,
            autoPlay:   false,
        }, prefs);

        return this;
    },

    initSubjects: function() {
        this.subjects = [];
        return this;
    },

    reset: function() {
        this.target    = 0; // hodnoty od 0 do 1
        this.state     = 0;
        this.lastTime  = null;
        this.looping   = false;
        this.subjects  = this.subjects || [];
        return this;
    },

    // each subject must be callable
    addSubject: function(sub) {
        if (sub && (
                typeof sub.setAnimationState == "function" ||
                typeof sub.animationState != "undefined"
            )) {
            this.subjects.push(sub);
        }
        return this;
    },

    // animate from the current state to provided value
    seekTo: function(to) {
        return this.seekFromTo(this.state, to);
    },

    // animate from the current state to provided value
    seekFromTo: function(from, to) {
        this.state    = Math.max(0, Math.min(1, from));
        this.target   = Math.max(0, Math.min(1, to));
        this.lastTime = Date.now();
        return this;
    },

    // animate from the current state to provided value
    jumpTo: function(to) {
        this.target = this.state = Math.max(0, Math.min(1, to));
        return this.propagate();
    },

    // seek to the opposite of the current target
    toggle: function() {
        return this.seekTo(1 - this.target);
    },

    // called on each frame
    update: function() {
        var now = Date.now(),
            dt  = now - this.lastTime;

        this.lastTime = now;

        var movement = (dt / this.options.duration) * (this.state < this.target ? 1 : -1);

        if (Math.abs(movement) >= Math.abs(this.state - this.target)) {
            this.state = this.target;
        } else {
            this.state += movement;
        }

        this.propagate();

        this.options.onUpdate.call(this);

        if (this.target == this.state) {
            this.stop();
        }
    },

    // forward the current state to the animation subjects
    propagate: function() {
        var value = this.options.transition(this.state);

        // if it quacks like a duck...
        this.subjects.forEach(function (sub) {
            if (typeof sub.setAnimationState == "function") { // let's consider it as a setter
                sub.setAnimationState(value);
            } else if (typeof sub.animationState != "undefined") { // and this as raw property
                sub.animationState = value;
            } // else silence
        });

        return this;
    },

    //
    stop: function() {
        if (this.options.looping) {
            return this.play();
        }
        this.options.onComplete.call(this);
        return this;
    },

    //
    play: function() {
        return this.seekFromTo(0, 1);
    },

    //
    reverse: function() {
        return this.seekFromTo(1, 0)
    },

}

Animation.tx = {

    linear: function(x) {
        return x;
    },

    easeInOut: function(x) {
        return ((-Math.cos(x * Math.PI) / 2) + 0.5);
    },
}

/**
 * Ball
 */
function Ball(spec) {
    this.game     = spec.game;
    this.w        = spec.size;
    this.h        = spec.size;
    this.canvasW  = spec.canvasW;
    this.canvasH  = spec.canvasH;

    this.x        = (this.canvasW - this.w) / 2;
    this.y        = (this.canvasH - this.h) / 2;;
    this.minSpeed = 0;
    this.maxSpeed = 30;
    this.vx       = (util.randomChoice([1,-1])) * util.randomInt(this.minSpeed+1, this.maxSpeed/2);
    this.vy       = (util.randomChoice([1,-1])) * util.randomInt(this.minSpeed+1, this.maxSpeed/2);

    this.surfaceFrictionFactor = .995; // 1 = no friction
    this.bounceFrictionFactor  = -.85;   // musi byt zaporne

    // this.antialiased = true;

}

Ball.prototype = {

    move: function () {
        var that = this, origX = this.x, origY = this.y;

        // move
        this.x += this.vx;
        this.y += this.vy;

        // x bounce
        if (this.x + this.w > this.canvasW) {
            this.x = this.canvasW - this.w;
            this.vx *= this.bounceFrictionFactor;
        } else if (this.x < 0) {
            this.x = 0;
            this.vx *= this.bounceFrictionFactor;
        }

        // y bounce
        if (this.y + this.h > this.canvasH) {
            this.y = this.canvasH - this.h;
            this.vy *= this.bounceFrictionFactor;
        } else if (this.y < 0) {
            this.y = 0;
            this.vy *= this.bounceFrictionFactor;
        }

        // apply surface frictions, but never slow down below min speed
        ["vx", "vy"].forEach(function(s) {
            if (Math.abs(that[s]) < that.minSpeed) {
                that[s] = (that[s] < 0 ? -1 : 1) * that.minSpeed;
            } else {
                that[s] *= that.surfaceFrictionFactor;
            }
        });

        this.game.dirty = this.game.dirty || (origX != this.x || origY != this.y); // hm...
    },

    changeSpeed: function (s, diff) {
        return this.setSpeed(s, this[s] + diff);
    },

    setSpeed: function (s, value) {
        this[s] = value;

        if (this[s] > 0) { // do prava
            this[s] = Math.min(this.maxSpeed, this[s]);
        } else { // do lava
            this[s] = Math.max(-this.maxSpeed, this[s]);
        }
    },

    draw: function (ctx) {
        // rounded coordinates should be more performant
        // var x = this.antialiased ? Math.round(this.x) : this.x;
        // var y = this.antialiased ? Math.round(this.y) : this.y;
        var x = this.x, y = this.y;

        ctx.fillRect(x, y, this.w, this.h);
    }
}

/**
 * Controls
 */
function Controls(config, game) {
    this.config = config;
    this.game   = game;
    this.init();
}

Controls.prototype = {

    init: function () {
        var that  = this,
            board = dom.get(this.config.canvasId);

        dom.on(document, "keydown", function (event) {
            // alert(event.keyCode);
            if (that.config.controls[event.keyCode]) {
                var handler = that.config.controls[event.keyCode];
                that.game[handler] && that.game[handler]();
            }
        });

        dom.on(board, "mousedown", function (event) {
            var handler = that.config.controls["click"];
            that.game[handler](event, "click", event);
        });

        // dom.on(board, "touchstart", function (event) {
        //     that.game.handleClick(event, "touch", event.targetTouches[0]);
        // });
    }

}

/**
 * Cursor
 */
function Cursor (config, canvas) {
    this.config   = config;
    this.canvas   = canvas;

    this.x = this.y = -1; // relative to canvas

    this.$debug = dom.get("cursor_xy");

    this.state = "up";

    this.init();
}

Cursor.prototype = {

    init: function() {
        var that = this;

        dom.on(this.config.canvasId, "mousemove", function (event) {
            return that.onMouseMove(event);
        }, false);

        dom.on(this.config.canvasId, "mousedown", function (event) {
            that.state = "down";
        }, false);

        dom.on(this.config.canvasId, "mouseup", function (event) {
            that.state = "up";
        }, false);
    },

    onMouseMove: function (event) {
        var pos = this.getCanvasRelative(event.pageX, event.pageY, this.canvas);

        this.x = pos.x;
        this.y = pos.y;

        this.$debug.innerHTML = "pos[x:" + this.x + ",y:" + this.y + "]";
    },

    getCanvasRelative: function(pageX, pageY, canvas) {

        var canvas = canvas || this.canvas,
            rect   = canvas.getBoundingClientRect();

        // NOTE: toto, ako zistujem, berie v uvahu aj css border... co je znacne
        // od veci... :(

        return {
            // x: pageX - this.canvas.offsetLeft,
            // y: pageY - this.canvas.offsetTop,
            x: pageX - rect.left,
            y: pageY - rect.top,
        }
    },
}

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

function Explosion() {
    this.animationState = 0;
    this.sprite = [
        "[|   ]",
        "[ |  ]",
        "[  | ]",
        "[   |]",
        "[  | ]",
        "[ |  ]",
    ];
    //this.sprite = ["[|]","[/]","[-]","[\\]"];
}

Explosion.prototype = {

    setAnimationState: function(state) {
        this.animationState = state;
    },

    draw: function() {
        var idx = Math.round(this.animationState * (this.sprite.length-1));
        dom.get("csl").innerHTML = this.sprite[idx];
    }

}

/**
 * FpsStats: Ratac fps. Aby sa mohlo runtimovo rozhodovat
 * napr. o (ne)pouziti expensive efektov/rozlisenia/animacii a pod...
 */
function FpsStats() {
    this.data = {};
}

FpsStats.prototype = {

    update: function (which) {

        // initialize container on first call
        if (typeof this.data[which] == "undefined") {
            this.data[which] = {frame: 0, fps: 0, prevTime: Date.now()};
        }

        var time = Date.now();
        this.data[which].frame++;

        if (time > this.data[which].prevTime + 1000) { // calculate once per second
            this.data[which].fps = Math.round(
                (this.data[which].frame * 1000) / (time - this.data[which].prevTime)
            );
            this.data[which].prevTime = time;
            this.data[which].frame = 0;
        }

        return this;
    }

}

/**
 * Game
 */
function Game (config, dic) {
    this.config = config;
    this.dic    = dic;
    this.init();
}

Game.prototype = {

    init: function () {
        this.reset();

        this.controls = new (this.dic.get("controls"))(this.config, this);

        this.ball = new Ball({
            size:    10,
            canvasW: this.config.width,
            canvasH: this.config.height,
            game:    this
        });

        this.animation = new Animation({
            subjects:   [new Explosion()],
            looping:    true,
            duration:   1000,
            transition: Animation.tx.linear,
            autoPlay:   true,
        });
        // this.animation.play();
        //this.$debug = dom.get("csl");
    },

    reset: function () {
        this.fps     = 30;
        this.step    = 1/this.fps;
        this.frame   = 0;
        this.cycle   = true;
        this.dirty   = true; // bude treba renderovat?
    },

    getSpeedStep: function (currentSpeed) {
        var step   = (this.ball.minSpeed + 1) * 2,
            factor = 1.5;
        return step * factor;
    },

    // nizsie move metody v tomto naivnom priklade patria skor do objekty Ball
    // ale z hladiska rozsirenia tu budu vhodnejsie

    handleRight: function () {
        this.ball.changeSpeed("vx", this.getSpeedStep(this.ball.vx));
    },

    handleLeft: function () {
        this.ball.changeSpeed("vx", -this.getSpeedStep(this.ball.vx));
    },

    handleDown: function () {
        this.ball.changeSpeed("vy", this.getSpeedStep(this.ball.vy));
    },

    handleUp: function () {
        this.ball.changeSpeed("vy", -this.getSpeedStep(this.ball.vy));
    },

    togglePause: function() {
        (this.cycle = !this.cycle) && run();
    },

    // toggleBallAntialiasing: function() {
    //     this.ball.antialiased = !this.ball.antialiased;
    // },

    handleClick: function (event, control, click) {
        // prevent default click behavior
        event.preventDefault();

    },

    update: function (dt) {
        this.frame++;
        this.ball.move();

        this.animation.update();

        //dom.get("csl").innerHTML = (this.animation.state * 100).toFixed(2);
        // this.$debug.innerHTML = this.animation.state;
        //console.log(this.animation.state + " - " + this.xxx.state);
    },

}

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

/**
 * Renderer
 */
function Renderer (config, game, dic) {
    this.config = config;
    this.game   = game;
    this.dic    = dic;

    this.init();
}

Renderer.prototype = {

    init: function () {
        this.reset();
    },

    reset: function () {
        this.canvas        = dom.get(this.config.canvasId);
        this.canvas.width  = this.config.width;
        this.canvas.height = this.config.height;
        this.ctx           = this.canvas.getContext('2d');
        this.frame         = 0; // aktualne nevyuzivane
    },

    update: function () {
        this.frame++;

        if (!this.game.dirty) {
            return;
        };

        this.game.animation.subjects[0].draw();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.game.ball.draw(this.ctx);
        this.game.dirty = false;
    }
}

/**
 * Textovy indikator, ze sa nieco deje...
 */
function Spinner (sprite) {
    this.counter = 0;
    this.pos     = 0;
    this.sprite  = sprite || ["[|]","[/]","[-]","[\\]"];
}
Spinner.prototype = {
    ping: function (slowDown) {
        if (++this.counter % slowDown != 1) { // slow down
            return this.sprite[this.pos];
        }

        if (++this.pos >= this.sprite.length) {
            this.pos = 0;
        }

        return this.sprite[this.pos];
    }
}

// import needed "externals" to local scope
    var mm = window.mm, dom = window.dom, util = window.util;

    // few "global" objects (as few as possible)
    var config, game, renderer, cursor, dic = new Dic();

    // misc app constants
    var KEY = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ESC: 27//, A: 65
    };

    // config may be also extended at run time with provided spec
    config = mm.extend({}, {
        width:    300,
        height:   300,
        canvasId: 'canvas',
        controls: {},
    });

    // mapa kontrol klaves a ich handlerov
    config.controls[KEY.LEFT]  = "handleLeft";
    config.controls[KEY.UP]    = "handleUp";
    config.controls[KEY.RIGHT] = "handleRight";
    config.controls[KEY.DOWN]  = "handleDown";
    config.controls[KEY.ESC]   = "togglePause";
    config.controls["click"]   = "handleClick";
    // config.controls["touch"]   = "handleClick";

    /**
     *
     */
    function init(prefs) {
        mm.extend(config, prefs || {});

        // define dependency (dic) stuff here (tu iba akoze)
        dic.share("fpsStats", function() {return new FpsStats()});
        dic.set("controls",   function() {return Controls});

        // instantiate main app objects
        game     = new Game(config, dic);
        renderer = new Renderer(config, game, dic);
        cursor   = new Cursor(config, renderer.canvas);
    }

    /**
     *
     */
    function run() {
        return cycle(game, renderer, dic.get("fpsStats"));
    }

    /**
     * public api
     */
    return {
        run: function (prefs) {
            init(prefs);
            run();
        }
    }

})(window);