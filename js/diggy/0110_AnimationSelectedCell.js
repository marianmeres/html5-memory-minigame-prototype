function AnimationSelectedCell(cell) {
    this.state = 0;
    this.cell = cell;
}

AnimationSelectedCell.prototype = {
    setAnimationState: function (state) {
        this.state = state.state;
    },
    draw: function (ctx) {
        var pos = this.cell.position(), hidden = this.cell.getHiddenSprite();
        ctx.save();

        //ctx.globalAlpha = (Math.sin(this.state * Math.PI) / 2 + 0.5 ) * .3;
        ctx.globalAlpha = (Math.sin(this.state * Math.PI) / 2 + 0.5 ) * .3;

        ctx.drawImage(hidden.canvas,
            this.cell.randomHiddenIdx * 60, 0, // sx, sy
            this.cell.w, this.cell.h,          // sw, sh
            pos.x, pos.y,                      // dx, dy
            this.cell.w, this.cell.h           // dw, dh (no scaling)
        );
        ctx.restore();
    }
}