/**
 * Game
 */
function Game (config, dic) {
    this.config = config;
    this.dic    = dic;
    this.init();
}

Game.prototype = {

    init: function () {
        this.reset();

        this.controls = new (this.dic.get("controls"))(this.config, this);

        this.ball = new Ball({
            size:    10,
            canvasW: this.config.width,
            canvasH: this.config.height,
            game:    this
        });

        this.animation = new Animation({
            subjects:   [new Explosion()],
            looping:    true,
            duration:   1000,
            transition: Animation.tx.linear,
            autoPlay:   true,
        });
        // this.animation.play();
        //this.$debug = dom.get("csl");
    },

    reset: function () {
        this.fps     = 30;
        this.step    = 1/this.fps;
        this.frame   = 0;
        this.cycle   = true;
        this.dirty   = true; // bude treba renderovat?
    },

    getSpeedStep: function (currentSpeed) {
        var step   = (this.ball.minSpeed + 1) * 2,
            factor = 1.5;
        return step * factor;
    },

    // nizsie move metody v tomto naivnom priklade patria skor do objekty Ball
    // ale z hladiska rozsirenia tu budu vhodnejsie

    handleRight: function () {
        this.ball.changeSpeed("vx", this.getSpeedStep(this.ball.vx));
    },

    handleLeft: function () {
        this.ball.changeSpeed("vx", -this.getSpeedStep(this.ball.vx));
    },

    handleDown: function () {
        this.ball.changeSpeed("vy", this.getSpeedStep(this.ball.vy));
    },

    handleUp: function () {
        this.ball.changeSpeed("vy", -this.getSpeedStep(this.ball.vy));
    },

    togglePause: function() {
        (this.cycle = !this.cycle) && run();
    },

    // toggleBallAntialiasing: function() {
    //     this.ball.antialiased = !this.ball.antialiased;
    // },

    handleClick: function (event, control, click) {
        // prevent default click behavior
        event.preventDefault();

    },

    update: function (dt) {
        this.frame++;
        this.ball.move();

        this.animation.update();

        //dom.get("csl").innerHTML = (this.animation.state * 100).toFixed(2);
        // this.$debug.innerHTML = this.animation.state;
        //console.log(this.animation.state + " - " + this.xxx.state);
    },

}