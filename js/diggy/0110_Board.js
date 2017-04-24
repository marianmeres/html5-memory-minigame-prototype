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

