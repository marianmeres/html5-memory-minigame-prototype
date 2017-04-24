/**
 * Textovy indikator, ze sa nieco deje...
 */
function Spinner (sprite) {
    this.counter = 0;
    this.pos     = 0;
    this.sprite  = sprite || ["[|]","[/]","[-]","[\\]"];
}
Spinner.prototype = {
    ping: function (slowDown) {
        if (++this.counter % slowDown != 1) { // slow down
            return this.sprite[this.pos];
        }

        if (++this.pos >= this.sprite.length) {
            this.pos = 0;
        }

        return this.sprite[this.pos];
    }
}