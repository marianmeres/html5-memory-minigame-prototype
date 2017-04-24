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