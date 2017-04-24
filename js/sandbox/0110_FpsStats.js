/**
 * FpsStats: Ratac fps. Aby sa mohlo runtimovo rozhodovat
 * napr. o (ne)pouziti expensive efektov/rozlisenia/animacii a pod...
 */
function FpsStats() {
    this.data = {};
}

FpsStats.prototype = {

    update: function (which) {

        // initialize container on first call
        if (typeof this.data[which] == "undefined") {
            this.data[which] = {frame: 0, fps: 0, prevTime: Date.now()};
        }

        var time = Date.now();
        this.data[which].frame++;

        if (time > this.data[which].prevTime + 1000) { // calculate once per second
            this.data[which].fps = Math.round(
                (this.data[which].frame * 1000) / (time - this.data[which].prevTime)
            );
            this.data[which].prevTime = time;
            this.data[which].frame = 0;
        }

        return this;
    }

}