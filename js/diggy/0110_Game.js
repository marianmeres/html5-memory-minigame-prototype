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