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