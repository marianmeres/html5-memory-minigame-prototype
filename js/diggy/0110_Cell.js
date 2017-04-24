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
