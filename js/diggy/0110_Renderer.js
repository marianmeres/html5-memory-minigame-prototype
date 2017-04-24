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