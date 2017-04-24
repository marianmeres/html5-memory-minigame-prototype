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