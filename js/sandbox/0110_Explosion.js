function Explosion() {
    this.animationState = 0;
    this.sprite = [
        "[|   ]",
        "[ |  ]",
        "[  | ]",
        "[   |]",
        "[  | ]",
        "[ |  ]",
    ];
    //this.sprite = ["[|]","[/]","[-]","[\\]"];
}

Explosion.prototype = {

    setAnimationState: function(state) {
        this.animationState = state;
    },

    draw: function() {
        var idx = Math.round(this.animationState * (this.sprite.length-1));
        dom.get("csl").innerHTML = this.sprite[idx];
    }

}