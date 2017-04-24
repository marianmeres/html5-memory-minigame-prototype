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