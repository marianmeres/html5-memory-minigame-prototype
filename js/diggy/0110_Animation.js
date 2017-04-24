/**
 * Zakladna functionalita prevzata z Animator.js (Copyright Bernard Sumption),
 * doplnene a upravene.
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
            // to allow human friendly lookup if needed
            id: null,
            // overall duraction of anim loop in miliseconds
            duration: 1000,
            // called on each update
            onUpdate: function(){},
            // called on complete if animation is not looping. Never called if looping.
            onComplete: function(){},
            // callback function to transition current state
            transition: null,
            // start automatically on construction?
            autoPlay: false,
            // never ending story?
            looping: false,
            // called on each loop copletition. Never called if not looping.
            onLoopEnd: function(){},
            // helper flag, the desctruction not handled here
            autoDestruct: false,
        }, prefs);

        return this;
    },

    initSubjects: function() {
        this.subjects = [];
        return this;
    },

    reset: function() {
        this.target   = 0; // hodnoty od 0 do 1
        this.state    = 0;
        this.lastTime = null;
        this.subjects = this.subjects || [];
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

        this.options.onUpdate.call(this);

        this.propagate();

        if (this.target == this.state) {
            this.stop();
        }
    },

    // forward the current state to the animation subjects
    propagate: function() {
        var tr = this.options.transition;

        var value = {
            state:      this.state,
            // ak nie je tak de facto linear
            transition: typeof tr == "function" ? tr(this.state) : this.state,
        };

        // if it quacks like a duck...
        this.subjects.forEach(function (sub) {
            if (typeof sub.setAnimationState == "function") { // let's consider it as a setter
                sub.setAnimationState(value);
            } else if (typeof sub.animationState != "undefined") { // and this as raw property
                sub.animationState = value;
            }
        });

        return this;
    },

    //
    stop: function() {
        if (this.options.looping) {
            this.options.onLoopEnd.call(this);
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

    // will execute function "name" on each subject
    execute: function (name) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.subjects.forEach(function (s) {
            // typeof s[name] == "function" && s[name]();
            if (typeof s[name] == "function") {
                s[name].apply(s, args)
            }
        });
    },

    // toto len experimentalne... co ak ma iny state, ale
    // isRunning: function () {
    //     return this.state != 0 && this.state != this.target;
    // },
}

Animation.tx = {

    linear: function(x) {
        return x;
    },

    easeInOut: function(x) {
        return ( (-Math.cos(x * Math.PI) / 2) + 0.5 );
    },
}

