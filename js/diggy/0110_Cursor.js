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