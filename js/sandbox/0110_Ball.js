/**
 * Ball
 */
function Ball(spec) {
    this.game     = spec.game;
    this.w        = spec.size;
    this.h        = spec.size;
    this.canvasW  = spec.canvasW;
    this.canvasH  = spec.canvasH;

    this.x        = (this.canvasW - this.w) / 2;
    this.y        = (this.canvasH - this.h) / 2;;
    this.minSpeed = 0;
    this.maxSpeed = 30;
    this.vx       = (util.randomChoice([1,-1])) * util.randomInt(this.minSpeed+1, this.maxSpeed/2);
    this.vy       = (util.randomChoice([1,-1])) * util.randomInt(this.minSpeed+1, this.maxSpeed/2);

    this.surfaceFrictionFactor = .995; // 1 = no friction
    this.bounceFrictionFactor  = -.85;   // musi byt zaporne

    // this.antialiased = true;

}

Ball.prototype = {

    move: function () {
        var that = this, origX = this.x, origY = this.y;

        // move
        this.x += this.vx;
        this.y += this.vy;

        // x bounce
        if (this.x + this.w > this.canvasW) {
            this.x = this.canvasW - this.w;
            this.vx *= this.bounceFrictionFactor;
        } else if (this.x < 0) {
            this.x = 0;
            this.vx *= this.bounceFrictionFactor;
        }

        // y bounce
        if (this.y + this.h > this.canvasH) {
            this.y = this.canvasH - this.h;
            this.vy *= this.bounceFrictionFactor;
        } else if (this.y < 0) {
            this.y = 0;
            this.vy *= this.bounceFrictionFactor;
        }

        // apply surface frictions, but never slow down below min speed
        ["vx", "vy"].forEach(function(s) {
            if (Math.abs(that[s]) < that.minSpeed) {
                that[s] = (that[s] < 0 ? -1 : 1) * that.minSpeed;
            } else {
                that[s] *= that.surfaceFrictionFactor;
            }
        });

        this.game.dirty = this.game.dirty || (origX != this.x || origY != this.y); // hm...
    },

    changeSpeed: function (s, diff) {
        return this.setSpeed(s, this[s] + diff);
    },

    setSpeed: function (s, value) {
        this[s] = value;

        if (this[s] > 0) { // do prava
            this[s] = Math.min(this.maxSpeed, this[s]);
        } else { // do lava
            this[s] = Math.max(-this.maxSpeed, this[s]);
        }
    },

    draw: function (ctx) {
        // rounded coordinates should be more performant
        // var x = this.antialiased ? Math.round(this.x) : this.x;
        // var y = this.antialiased ? Math.round(this.y) : this.y;
        var x = this.x, y = this.y;

        ctx.fillRect(x, y, this.w, this.h);
    }
}