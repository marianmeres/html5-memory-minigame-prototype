var diggy = (function (window) {

    /**
     * Hlavny loop. Implementuje "fixed timestep":
     * http://gafferongames.com/game-physics/fix-your-timestep/
     */
    function cycle (game, renderer, fpsStats) {

        // make sure to loop at first run
        game.cycle = true;

        var now, last = util.now(), dt = 0, gdt = 0; // , rdt = 0

        function frame() {
            now = Date.now();

            // using requestAnimationFrame have to be able to handle large
            // delta's caused when it 'hibernates' in a background or non-visible tab
            dt = Math.min(1, (now - last) / 1000);

            // fixed timestep
            gdt = gdt + dt;
            while (gdt > game.step) {
                gdt = gdt - game.step;
                (fpsStats && fpsStats.update("app"));
                game.update();
            }

            //
            (fpsStats && fpsStats.update("renderer"));
            renderer.update();

            //
            last = now;

            // unless we have not stopped, continue looping
            if (game.cycle) {
                // passing the canvas element as the second argument means only
                // the currently visible canvases get updated. (WebKit-specific though).
                requestAnimationFrame(frame, renderer.canvas);
            }
        }
        frame();
    }


    function prx(val, useConsole) {
        var fn = useConsole ? console.log : alert;
        fn(JSON.stringify(val));
    }




