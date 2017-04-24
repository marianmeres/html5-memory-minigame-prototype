/*cached:9bc0c5.js*/

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
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomChoice: function(options) {
        // return options[util.randomInt(0, options.length-1)];
        return options[Math.floor(Math.random() * options.length)]
    }
};

var diggy = (function (window) {

    /**
     * Hlavny loop. Implementuje "fixed timestep":
     * http://gafferongames.com/game-physics/fix-your-timestep/
     */
    function cycle (game, renderer, fpsStats) {

        // make sure to loop at first run
        game.cycle = true;

        var now, last = util.now(), dt = 0, gdt = 0; // , rdt = 0

        function frame() {
            now = Date.now();

            // using requestAnimationFrame have to be able to handle large
            // delta's caused when it 'hibernates' in a background or non-visible tab
            dt = Math.min(1, (now - last) / 1000);

            // fixed timestep
            gdt = gdt + dt;
            while (gdt > game.step) {
                gdt = gdt - game.step;
                (fpsStats && fpsStats.update("app"));
                game.update();
            }

            //
            (fpsStats && fpsStats.update("renderer"));
            renderer.update();

            //
            last = now;

            // unless we have not stopped, continue looping
            if (game.cycle) {
                // passing the canvas element as the second argument means only
                // the currently visible canvases get updated. (WebKit-specific though).
                requestAnimationFrame(frame, renderer.canvas);
            }
        }
        frame();
    }


    function prx(val, useConsole) {
        var fn = useConsole ? console.log : alert;
        fn(JSON.stringify(val));
    }

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

function AnimationPairedCell(cell) {
    this.state = 0;
    this.cell = cell;
}

AnimationPairedCell.prototype = {
    setAnimationState: function (state) {
        this.state = state.state;
    },
    draw: function (ctx) {
        var pos   = this.cell.position(),
            shown = this.cell.getShownSprite();

        ctx.save();

        ctx.globalAlpha = 1 - this.state;

        ctx.drawImage(shown.canvas,
            this.cell.type * 60, 0, // sx, sy
            this.cell.w, this.cell.h,          // sw, sh
            pos.x, pos.y,                      // dx, dy
            this.cell.w, this.cell.h           // dw, dh (no scaling)
        );

        ctx.restore();
    }
}

function AnimationSelectedCell(cell) {
    this.state = 0;
    this.cell = cell;
}

AnimationSelectedCell.prototype = {
    setAnimationState: function (state) {
        this.state = state.state;
    },
    draw: function (ctx) {
        var pos = this.cell.position(), hidden = this.cell.getHiddenSprite();
        ctx.save();

        //ctx.globalAlpha = (Math.sin(this.state * Math.PI) / 2 + 0.5 ) * .3;
        ctx.globalAlpha = (Math.sin(this.state * Math.PI) / 2 + 0.5 ) * .3;

        ctx.drawImage(hidden.canvas,
            this.cell.randomHiddenIdx * 60, 0, // sx, sy
            this.cell.w, this.cell.h,          // sw, sh
            pos.x, pos.y,                      // dx, dy
            this.cell.w, this.cell.h           // dw, dh (no scaling)
        );
        ctx.restore();
    }
}

/**
 *
 */
function Board(dic, rows, cols, game) {
    this.dic    = dic;
    this.rows   = rows;
    this.cols   = cols;

    this.config = this.dic.get("config");
    this.game   = game;
    this.canvas = this.dic.get('canvas');
    this.ctx    = this.canvas.getContext('2d');

    this.init();
}

Board.prototype = {

    init: function () {
        this.cells = [];
        this.moves = 0;
        //this.movedCellCount = 0;

        // ked prebieha animacia, tak nehandlujeme nic
        this.inputDisabled = false;

        // posun boardu voci [0, 0] canvasu
        this.offsetLeft = 120;
        this.offsetTop  = 120;

        // ak sme neparny, tak jeden bude block... poziciu si nahodne vyberieme uz tu
        var blockPos = null, total = this.rows * this.cols;
        if (total % 2 == 1) {
            blockPos = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows),
            }
        }

        var Cell = this.dic.get("cell"), // injected contructor
            type,
            available = {};

        // naplnime si "typy", co budu cisla spritu (zacinajuce od 0)
        var typeCount = (total - (blockPos ? 1 : 0)) / 2;
        for (var i = 0; i < typeCount; i++) {
            available[i] = 2;
        }

        // helper na "odstrihavanie" z available. Ide o to, ze budeme sice vyberat
        // nahodne, ale musia byt picky v paroch
        function getRandomAvailable() {
            var idx = [], i, pick;
            for (i in available) {
                idx.push(i);
            }
            pick = idx[Math.floor(Math.random() * idx.length)];
            (!--available[pick] && (delete available[pick]));
            return pick;
        }

        for (var x = 0; x < this.cols; x++) {
            this.cells[x] = [];
            for (var y = 0; y < this.rows; y++) {
                if (blockPos && x == blockPos.x && y == blockPos.y) {
                    type = Cell.BLOCK;
                } else {
                    type = getRandomAvailable();
                }

                this.cells[x][y] = new Cell(x, y, type, this, this.ctx);
            }
        }

        console.log(this.toString() + "");
    },

    draw: function () {
        for (var x = 0; x < this.cols; x++) {
            for (var y = 0; y < this.rows; y++) {
                this.cells[x][y].draw();
            }
        }
    },

    getCellByBoardCursor: function (boardX, boardY) {
        // var x = Math.floor(boardX/this.config.cell.w),
        //     y = Math.floor(boardY/this.config.cell.h);

        var pos = this.getCellPositionByBoardCursor(boardX, boardY),
            x   = pos.x,
            y   = pos.y;

        if (typeof this.cells[x] != "undefined" && typeof this.cells[x][y] != "undefined" && this.cells[x][y]) {
            return this.cells[x][y];
        }
        return null;
    },

    // getCellByCanvasCursor: function (canvasX, canvasY) {
    //     return this.getCellByBoardCursor(canvasX - this.offsetLeft, canvasY - this.offsetTop);
    // },

    getCellByPageCursor: function(pageX, pageY) {
        var rect = this.canvas.getBoundingClientRect(),
            x    = pageX - this.offsetLeft - rect.left, //this.canvas.offsetLeft
            y    = pageY - this.offsetTop  - rect.top;  //  - this.canvas.offsetTop
        return this.getCellByBoardCursor(x, y);
    },

    getCellPositionByBoardCursor: function(boardX, boardY) {
        var x = Math.floor(boardX/this.config.cell.w),
            y = Math.floor(boardY/this.config.cell.h);

        x = Math.min(this.config.board.w-1, Math.max(0, x));
        y = Math.min(this.config.board.h-1, Math.max(0, y));

        return {x: x, y: y};
    },

    countSelectedCells: function () {
        var result = 0;
        for (var x = 0; x < this.cols; x++) {
            for (var y = 0; y < this.rows; y++) {
                var cell = this.cells[x][y];
                if (cell.is(Cell.STATE_SELECTED)) { // cell.isPlayableType() &&
                    result++;
                }
            }
        }
        return result;
    },

    findSelectedPair: function () {
        var selected = [];
        for (var x = 0; x < this.cols; x++) {
            for (var y = 0; y < this.rows; y++) {
                var cell = this.cells[x][y];
                // pairnute mozu byt len selected
                if (cell.is(Cell.STATE_SELECTED)) {
                    // prvy dame medzi selected bez diskusie
                    if (!selected.length) {
                        selected.push(cell);
                    }
                    // inak uz pozerame
                    else if (selected[0].type == cell.type) {
                        selected.push(cell);
                        return selected;
                    }
                }
            }
        }
        return [];
    },

    // helper na iteraciu
    eachCell: function (callback) {
        for (var x = 0; x < this.cols; x++) {
            for (var y = 0; y < this.rows; y++) {
                callback.call(this, this.cells[x][y]);
            }
        }
        return this;
    },

    handleClick: function (cell) {
        if (!cell) {
            alert("error: not cell"); // raw debug
        }

        //this.debug(cell);

        if (this.inputDisabled) {
            return this;
        }

        // ak mame "clicked" uz 2, tak reset
        if (2 == this.countSelectedCells()) {
            this.eachCell(function (c) {
                c.setSelected(false);
            });
            return this;
        }

        // ak sme zly typ, tak return early
        // if (cell.type == Cell.BLOCK || cell.type == Cell.EMPTY || cell.type == Cell.MOVED) {
        if (cell.type == Cell.BLOCK || cell.type == Cell.EMPTY || cell.is(Cell.STATE_MOVED)) {
            return this;
        }

        this.moves++;

        // ak sme uz naparovany (alebo co este?), tak return early
        if (cell.is(Cell.STATE_PAIRED)) {
            return this;
        }

        // nastavime current na selected
        cell.setSelected(true);

        // mame par?
        var pair = this.findSelectedPair();
        if (pair.length) {
            this.playPairedSound();
            pair.forEach(function (c) {
                c.xset(Cell.STATE_PAIRED, 1);
                c.setSelected(false);
                c.startPairedAnimation();
            });
        }

        return this;
    },

    checkEnd: function() {
        var empty = this.countCells(Cell.EMPTY);
        if (24 == empty) { // improve
            alert("Je to tam! Teraz porovnam skore s tvojimi priatelmi a ak si na tom dobre dostanes gemy... Mozno nejaky dalsi level");
            window.location.reload();
        }
    },

    countCells: function(type, state) {
        var result = 0;
        (typeof state == "undefined" && (state = 0));
        for (var x = 0; x < this.cols; x++) {
            for (var y = 0; y < this.rows; y++) {
                c = this.cells[x][y];
                if (c.type == type && c.is(state)) {
                    result++;
                }
            }
        }
        return result;
    },

    countCellsBellow: function (x, y, type, state, stopOnBlock) {
        var x = Math.min(this.cols-1, Math.max(0, x)),
            y = Math.min(this.rows-1, Math.max(0, y)),
            result = 0;

        (typeof state == "undefined"       && (state = 0));
        (typeof stopOnBlock == "undefined" && (stopOnBlock = true));

        while (++y < this.rows) {
            c = this.cells[x][y];
            if (c.type == type && c.is(state)) {
                result++;
            }
            if (stopOnBlock && c.type == Cell.BLOCK) {
                return result;
            }
        }
        return result;
    },

    //
    moveCells: function() {
        this.inputDisabled = true;

        var map = [], emptyBelow, cells = [], debug = {};

        // pripravime mapu
        for (var x = 0; x < this.cols; x++) {
            map[x] = [];
            for (var y = 0; y < this.rows; y++) {
                if (this.cells[x][y].type != Cell.EMPTY) {
                    emptyBelow = 0;
                    if (this.cells[x][y].type != Cell.BLOCK) {
                        emptyBelow = this.countCellsBellow(x, y, Cell.EMPTY);
                    }
                    map[x][y] = [x,(y + emptyBelow)];
                    debug[x + "_" + y] = x + "_" + (y + emptyBelow);
                }
            }
        }
        // console.log(map);
        //console.log(debug);

        // namapujeme povodne
        var tx, ty;
        for (var x = 0; x < this.cols; x++) {
            cells[x] = [];
            for (var y = 0; y < this.rows; y++) {
                if (typeof map[x][y] != "undefined") {
                    tx = map[x][y][0];
                    ty = map[x][y][1];

                    cells[tx][ty] = this.cells[x][y].clone();
                    cells[tx][ty].x = tx; // toto je vzdy rovnake
                    cells[tx][ty].y = ty;
                }/* else {
                    cells[x][y] = new Cell(x, y, Cell.EMPTY, this, this.ctx);
                }*/
            }
        }

        // a do tretice prazdne
        for (var x = 0; x < this.cols; x++) {
            for (var y = 0; y < this.rows; y++) {
                if (typeof cells[x][y] == "undefined") {
                    cells[x][y] = new Cell(x, y, Cell.EMPTY, this, this.ctx);
                }
            }
        }

        //console.log("new:");
        //console.log(this.toString(cells));

        this.cells = cells;

        console.log(this.toString() + "");

        this.checkEnd();

        this.inputDisabled = false;
    },


    // debug
    toString: function (cells) {
        var out = '';

        if (typeof cells == "undefined") {
            cells = this.cells;
        }

        for (var x = 0; x < this.cols; x++) {
            for (var y = 0; y < this.rows; y++) {
                var c = cells[y][x];
                var suffix = '';

                c.is(Cell.STATE_MOVED) && (suffix += "*");
                c.is(Cell.STATE_DONE)  && (suffix += "~");

                out += "(" + c.type + suffix + "),";
            }
            out += "\n";
        }
        return out;
    },

    playSeletectedSound: function(){
        this.$cellSelectAudio = this.$cellSelectAudio || dom.get("cell_select");
        this.$cellSelectAudio && this.$cellSelectAudio.play();
    },

    playPairedSound: function(){
        this.$cellPairedAudio = this.$cellPairedAudio || dom.get("cell_pair");
        this.$cellPairedAudio && this.$cellPairedAudio.play();
    },

    debug: function(cell) {
        console.log("[" + cell.x +  "," + cell.y + "], type:" + cell.type
            + ", state:" + cell.state + ", play:" + cell.isPlayableType());
    }
}

/**
 *
 */
function Cell(x, y, type, board, ctx) {
    this.x      = x;
    this.y      = y;
    this.type   = type;
    this.board  = board;
    this.ctx    = ctx;
    this.config = this.board.config;
    this.game   = this.board.game;

    this.init();
}

Cell.BLOCK = "X";
Cell.EMPTY = "_";
Cell.MOVED = "=";

// cell state bitmask
Cell.STATE_READY     =   1; // "normal", init state
Cell.STATE_SELECTED  =   2; // mouse down
Cell.STATE_PAIRED    =   4; // matched pair
Cell.STATE_FALLING   =   8; //
Cell.STATE_DONE      =  16; //
Cell.STATE_ANIMATING =  32;
Cell.STATE_MOVED     =  64;

Cell.prototype = {
    init: function () {
        this.w = this.config.cell.w;
        this.h = this.config.cell.h;

        this.dirty = true;
        this.state = Cell.STATE_READY;

        // aku krabicu bude mat cell?
        this.randomHiddenIdx = Math.round(Math.random() * 2);
        this.randomBlockIdx = 0; // do buducna mozno random
    },

    clone: function () {
        var cell = new Cell(this.x, this.y, this.type, this.board, this.ctx);
        cell.state = this.state;
        cell.randomHiddenIdx = this.randomHiddenIdx;
        cell.randomBlockIdx = this.randomBlockIdx;
        return cell;
    },

    update: function () {

    },

    draw: function () {

        var pos    = this.position(),
            ctx    = this.ctx,
            shown  = this.getShownSprite(),
            hidden = this.getHiddenSprite(),
            block  = this.getBlockSprite();

        ctx.save();

        if (this.type != Cell.EMPTY) {

            // drawImage(Element image, double sx, sy, sw, sh, dx, dy, dw, dh)

            if (this.type == Cell.BLOCK) {

                ctx.drawImage(block.canvas,
                    this.randomBlockIdx * 60, 0, // sx, sy
                    this.w, this.h,    // sw, sh
                    pos.x, pos.y,      // dx, dy
                    this.w, this.h     // dw, dh (no scaling)
                );

            } else {

                // elementy vykreslime vzdy, i ked ich neskor mozno prekryjem (co
                // je v zasade zle a drahe)...
                // ide mi ale o to, ze nejaky power-up mozno neskor znizi transparenciu
                // a teraz prototypujeme...
                if (!this.is(Cell.STATE_PAIRED)) {
                    ctx.drawImage(shown.canvas,
                        this.type * 60, 0, // sx, sy
                        this.w, this.h,    // sw, sh
                        pos.x, pos.y,      // dx, dy
                        this.w, this.h     // dw, dh
                    );
                }

                if (!this.is(Cell.STATE_PAIRED) && !this.is(Cell.STATE_SELECTED)) {
                    ctx.drawImage(hidden.canvas,
                        this.randomHiddenIdx * 60, 0, // sx, sy
                        this.w, this.h,    // sw, sh
                        pos.x, pos.y,      // dx, dy
                        this.w, this.h     // dw, dh (no scaling)
                    );
                }
            }
        }

        ctx.restore();
    },

    isPlayableType: function() {
        // return this.type != Cell.BLOCK && this.type != Cell.EMPTY && this.type != Cell.MOVED;
        return this.type != Cell.BLOCK && this.type != Cell.EMPTY && !this.is(Cell.STATE_MOVED);
    },

    position: function() {
        return {
            x: this.board.offsetLeft + (this.x * this.w),
            y: this.board.offsetTop  + (this.y * this.h)
        };
    },

    getShownSprite: function () {
        if (this._shownSprite) {
            return this._shownSprite;
        }
        this._shownSprite = document.createElement('canvas').getContext('2d');
        this._shownSprite.canvas.width  = 60 * 12; // zatial natvrdo
        this._shownSprite.canvas.height = 60;

        this._shownSprite.drawImage(
            this.config.images.sprite,  // image
            0, 120,                     // sx, sy
            60 * 12, 60,                // sw, sh
            0, 0,                       // dx, dy
            60 * 12, 60                 // dw, dh
        );
        return this._shownSprite;
    },

    getHiddenSprite: function () {
        if (this._hiddenSprite) {
            return this._hiddenSprite;
        }
        this._hiddenSprite = document.createElement('canvas').getContext('2d');
        this._hiddenSprite.canvas.width  = 60 * 3; // zatial natvrdo
        this._hiddenSprite.canvas.height = 60;

        this._hiddenSprite.drawImage(
            this.config.images.sprite,  // image
            0, 0,                       // sx, sy
            60 * 3, 60,                 // sw, sh
            0, 0,                       // dx, dy
            60 * 3, 60                  // dw, dh
        );
        return this._hiddenSprite;
    },

    getBlockSprite: function () {
        if (this._blockSprite) {
            return this._blockSprite;
        }
        this._blockSprite = document.createElement('canvas').getContext('2d');
        this._blockSprite.canvas.width  = 60 * 1; // zatial natvrdo
        this._blockSprite.canvas.height = 60;

        this._blockSprite.drawImage(
            this.config.images.sprite,  // image
            0, 60,                       // sx, sy
            60 * 1, 60,                 // sw, sh
            0, 0,                       // dx, dy
            60 * 1, 60                  // dw, dh
        );
        return this._blockSprite;
    },

    resetState: function () {
        this.state = Cell.STATE_READY;
        return this;
    },

    is: function (state) {
        return (this.state & state) == state;
    },

    set: function (state, flag) {
        if (typeof flag == "undefined") {
            flag = true;
        }
        if (flag) {
            this.state = this.state | state;
        } else {
            this.state = this.state & ~state;
        }
        return this;
    },

    // "exlusive" set
    xset: function(state, flag) {
        this.state = 0;
        return this.set(state, flag);
    },

    toggle: function (state) {
        this.state = this.state ^ state; // xor
        return this;
    },

    setSelected: function(flag) {
        this.set(Cell.STATE_SELECTED, !!flag);

        if (flag) {
            if (!this.game.hasAnimation(this.getAnimId("cell_selected_"))) {
                this.startSelectedAnimation();
            }
            // anything else?
        } else {
            this.stopSelectedAnimation();
        }
        return this;
    },

    startSelectedAnimation: function() {
        this.game.animations.push(new Animation({
            subjects: [
                new AnimationSelectedCell(this)
            ],
            looping: true,
            duration: 1000,
            autoPlay: true,
            id: this.getAnimId("cell_selected_")
        }));
        this.board.playSeletectedSound();
        return this;
    },

    stopSelectedAnimation: function() {
        this.game.removeAnimation(this.getAnimId("cell_selected_"));
        return this;
    },

    getAnimId: function(prefix, cell) {
        cell = cell || this;
        return prefix + cell.x + "_" + cell.y;
    },

    startPairedAnimation: function() {
        var that = this;
        this.game.animations.push(new Animation({
            subjects: [
                new AnimationPairedCell(this)
            ],
            looping: false,
            duration: 250,
            autoPlay: true,
            id: this.getAnimId("cell_paired_"),
            onComplete: function() {
                that.type = Cell.EMPTY;
                that.xset(Cell.STATE_DONE);
                if (typeof that.board._tmpCellCount == "undefined") {
                    // kedze toto "onComplete" riesia nezavisle bunky, potrebujeme
                    // najaky centralny counter
                    that.board._tmpCellCount = 0;
                }
                if (++that.board._tmpCellCount == 2) {
                    that.board.moveCells();
                    that.board._tmpCellCount = 0;
                }
            },
            autoDestruct: true,
        }));
        return this;
    },

    stopPairedAnimation: function() {
        this.game.removeAnimation(this.getAnimId("cell_paired_"));
        return this;
    },

}

/**
 * Controls
 */
function Controls(dic, game) {
    this.dic    = dic;
    this.game   = game;

    this.config = this.dic.get("config");
    this.canvas = this.dic.get("canvas");

    this.init();
}

Controls.prototype = {

    init: function () {

        var that = this;

        dom.on(document, "keydown", function (event) {
            // alert(event.keyCode);
            if (that.config.controls[event.keyCode]) {
                var handler = that.config.controls[event.keyCode];
                that.game[handler] && that.game[handler]();
            }
        });

        dom.on(this.canvas, "mousedown", function (event) {
            var handler = that.config.controls["click"];
            that.game[handler](event, "click", event);
        });
    }

}

/**
 * Cursor
 */
function Cursor (dic) {
    this.dic = dic;
    this.canvas = dic.get("canvas");

    this.x = null;
    this.y = null;

    this.init();
}

Cursor.prototype = {

    init: function() {
        var that = this;

        dom.on(this.canvas, "mousemove", function (event) {
            return that.onMouseMove(event);
        }, false);

        this.debug(0, 0);
    },

    onMouseMove: function (event) {
        var pos = this.getCanvasRelative(event.pageX, event.pageY, this.canvas);
        this.x = pos.x;
        this.y = pos.y;

        this.debug(this.x, this.y);
    },

    debug: function(x, y) {
        var s = "cursor[x:" + x + ",y:" + y + "] ",
            board = this.dic.get('game').board,
            pos = board.getCellPositionByBoardCursor(x-board.offsetLeft, y-board.offsetTop);

        s += "cell[" + pos.x + "," + pos.y + "]"

        this.$debug = this.$debug || dom.get("debugCursor");
        this.$debug && (this.$debug.innerHTML = s);
    },

    getCanvasRelative: function(pageX, pageY, canvas) {

        var canvas = canvas || this.canvas,
            rect   = canvas.getBoundingClientRect();

        // NOTE: toto, ako zistujem, berie v uvahu aj css border (teda klasicka
        // DOM width)... co tu ale potencialne komplikuje veci

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
 *     dic.share("x", function(dic) {return X});
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
            var value = this._values[key];
            return (typeof value == "function") ? value(this) : value;
        }

        // fallback to default
        return defaultValue;
    },
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

        if (time > this.data[which].prevTime + 1000) { // once per second
            this.data[which].fps = Math.round(
                (this.data[which].frame * 1000) / (time - this.data[which].prevTime)
            );
            this.data[which].prevTime = time;
            this.data[which].frame = 0;
        }

        return this;
    },


    draw: function () {

        this.$console = this.$console || dom.get("debugFps");

        var str = "fps[r:" + this.data.renderer.fps;
        if (this.data.app) { // prvy zopar loopov bude undefined
            str += ",g:" + this.data.app.fps;
        }
        str += "]";
        this.$console.innerHTML = str;
    },

}

/**
 * Game
 */
function Game(dic) {
    this.dic           = dic;

    this.config        = this.dic.get("config");

    this.canvas        = this.dic.get("canvas");
    this.canvas.width  = this.config.width;
    this.canvas.height = this.config.height;

    this.fps           = 30;
    this.step          = 1/this.fps;
    this.frame         = 0;
    this.cycle         = true;
    this.dirty         = true; // defaultne pausalne renderuj
    this.animations    = [];

    this.controls      = new ( this.dic.get("controls") )(this.dic, this);
    this.board         = new ( this.dic.get("board") )(this.dic, this.config.board.w, this.config.board.h, this);
}

Game.prototype = {

    handleRight: function () {
        console.log("right");
    },

    handleLeft: function () {
        console.log("left");
    },

    handleDown: function () {
        console.log("down");
    },

    handleUp: function () {
        console.log("up");
    },

    handleClick: function (event, control, click) {
        // prevent default click behavior
        event.preventDefault();

        var cell = this.board.getCellByPageCursor(event.pageX, event.pageY);
        if (cell) {
            this.board.handleClick(cell);
        }
        // else todo....
    },

    handlePause: function() {
        return this;
        //(this.cycle = !this.cycle) && run();
    },

    update: function (dt) {
        this.frame++;
        this.updateAnimations();
    },

    updateAnimations: function() {
        var anims = [];

        for (var i = 0, l = this.animations.length; i < l; i++) {
            var a = this.animations[i];
            a.update();
            if (a.options.looping || a.state != 1 || !a.options.autoDestruct) {
                anims.push(a);
            }
        }

        this.animations = anims;
        return this;
    },

    hasAnimation: function(id) {
        for (var i = 0, l = this.animations.length; i < l; i++) {
            if (this.animations[i].options.id == id) {
                return true;
            }
        }
        return false;
    },

    removeAnimation: function(id) {
        var anims = [];
        this.animations.forEach(function(a){
            if (a.options.id != id) {
                anims.push(a);
            }
        });
        this.animations = anims;
        return this;
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
function Renderer (dic, game) {
    this.dic    = dic;

    this.game   = game || this.dic.get("game");
    this.config = this.dic.get("config");
    this.canvas = this.dic.get("canvas");

    this.init();
}

Renderer.prototype = {

    init: function () {
        this.ctx      = this.canvas.getContext('2d');
        this.frame    = 0; // aktualne nevyuzivane
        this.initSpinner();
    },

    update: function () {
        this.frame++;

        // toto musi byt nad dirty skipom... lebo toto chceme updtovat vzdy
        (this.dic.get("fpsStats") && this.dic.get("fpsStats").draw());

        if (!this.game.dirty) {
            return;
        };

        var that = this;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.game.board.draw();

        this.game.animations.forEach(function (a) {
            a.execute("draw", that.ctx);
        });

    },

    // taky quick-n-dirty textovy indikator main loopu...
    initSpinner: function () {

        var spinner = {
            state: 0,
            sprite: ["[|]","[/]","[-]","[\\]"],
            setAnimationState: function (state) {
                this.state = state.state;
            },
            draw: function(ctx) {
                var idx = Math.round(this.state * (this.sprite.length-1));
                this.$console = this.$console || dom.get("debugSpinner");
                this.$console.innerHTML = this.sprite[idx];
            }
        };

        this.game.animations.push(new Animation({
            subjects: [spinner], looping: true,
            duration: 200, autoPlay: true, id: "debugSpinner"
        }));
    },

}

//

    // import needed "externals" to local scope
    var mm = window.mm, dom = window.dom, util = window.util;

    // few "global" objects (as few as possible)
    var config, game, renderer, dic = new Dic(); //canvas,

    // misc app constants
    var KEY = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ESC: 27
    };

    // config may be also extended at run time with provided prefs
    config = mm.extend({}, {
        width:       540,
        height:      540,
        canvasId:    'board',
        controls:     {},
        cell:         {w: 60, h: 60},
        board:        {w: 5,  h: 5}, // rows, cols
        assets: { // assets to be preloaded
            sprite: "js/diggy/img/sprite.png",
        },
        images: {}, // to be set at runtime (at preload callback)
    });

    // mapa kontrol klaves a ich handlerov
    config.controls[KEY.LEFT]  = "handleLeft";
    config.controls[KEY.UP]    = "handleUp";
    config.controls[KEY.RIGHT] = "handleRight";
    config.controls[KEY.DOWN]  = "handleDown";
    config.controls["click"]   = "handleClick";
    config.controls[KEY.ESC]   = "handlePause";

    /**
     *
     */
    function init(prefs) {
        mm.extend(config, prefs || {});

        // tu si nadefinujeme (lazy) vsetky zavislosti... i ked realny zmysel
        // pri tejto aplikacii sa blizi nule, myslim, ze to vynuti
        // best practices z pohladu testovania (realny overhead dic je nula cela nic)

        dic.share("config",   config);
        dic.share("canvas",   dom.get(config.canvasId));
        dic.share("cursor",   function(dic){ return new Cursor(dic)});
        dic.share("fpsStats", function(dic){ return new FpsStats()});
        dic.share("game",     function(dic){ return new Game(dic)});
        dic.share("renderer", function(dic){ return new Renderer(dic, dic.get("game"))});

        dic.share("board",    function(){return Board}); // toto vracia constructor
        dic.share("cell",     function(){return Cell}); // toto vracia constructor
        dic.share("controls", function(){return Controls}); // toto vracia constructor
    }

    // zatial len nastrel
    function loadAssets(callback) {
        var imgMap = {}, sounds = {}, assets = config.assets;

        // rozdelime si to na dielcie veci...
        for (var i in assets) {
            if (/.+\.(jpg|png|gif)$/i.test(assets[i])) {
                imgMap[i] = assets[i];
            }
            // else if mp3, ogg todo
        }

        loadImages(imgMap, callback);
    }

    /**
     * load multiple images and callback when ALL images have loaded
     */
    function loadImages(map, callback) {
        var result = {}, img, count = 0;

        // kolko ich bude... @todo: toto nejde rozumnejsie?
        for (var i in map) {count++;}

        var onload = function() {
            if (--count == 0) {
                config.images = result;
                callback();
            }
        };

        for (var n in map) {
            img = document.createElement('img');
            dom.on(img, 'load', onload);
            img.src = map[n];
            result[n] = img;
        }
    }

    /**
     *
     */
    function run() {
        dic.get("cursor");
        cycle(dic.get("game"), dic.get("renderer"), dic.get("fpsStats"));
    }

    /**
     * public api
     */
    return {
        run: function (prefs) {
            init(prefs);
            loadAssets(run);
            // run();
        }
    }

})(window);