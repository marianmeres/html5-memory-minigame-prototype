function AnimationPairedCell(cell) {
    this.state = 0;
    this.cell = cell;
}

AnimationPairedCell.prototype = {
    setAnimationState: function (state) {
        this.state = state.state;
    },
    draw: function (ctx) {
        var pos   = this.cell.position(),
            shown = this.cell.getShownSprite();

        ctx.save();

        ctx.globalAlpha = 1 - this.state;

        ctx.drawImage(shown.canvas,
            this.cell.type * 60, 0, // sx, sy
            this.cell.w, this.cell.h,          // sw, sh
            pos.x, pos.y,                      // dx, dy
            this.cell.w, this.cell.h           // dw, dh (no scaling)
        );

        ctx.restore();
    }
}