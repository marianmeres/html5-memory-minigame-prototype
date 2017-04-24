var sandbox = (function (window) {

    /**
     * Hlavny loop. Implementuje "fixed timestep":
     * http://gafferongames.com/game-physics/fix-your-timestep/
     */
    function cycle (game, renderer, stats) {

        // make sure to loop at first run
        game.cycle = true;

        var now, last = util.now(), dt = 0, gdt = 0; // , rdt = 0

        var $spinner = dom.get("spinner"), $fps = dom.get("fps"), spinner = new Spinner();

        function frame() {
            now = Date.now();

            // using requestAnimationFrame have to be able to handle large
            // delta's caused when it 'hibernates' in a background or non-visible tab
            dt = Math.min(1, (now - last) / 1000);

            // http://gafferongames.com/game-physics/fix-your-timestep/
            // http://codeincomplete.com/
            gdt = gdt + dt;
            while (gdt > game.step) {
                gdt = gdt - game.step;
                game.update();
                (stats && stats.update("app"));
            }

            //
            renderer.update();
            (stats && stats.update("renderer"));

            //
            last = now;

            // unless we have not stopped, continue looping
            if (game.cycle) {
                // passing the canvas element as the second argument means only
                // the currently visible canvases get updated. (WebKit-specific though).
                requestAnimationFrame(frame, renderer.canvas);
            }

            // quick-n-dirty fps stats debug
            $spinner.innerHTML = spinner.ping(3);
            $fps.innerHTML = "fps[g:" + stats.data.app.fps + ",r:" + stats.data.renderer.fps + "]";;
        }

        frame(); // start the loop
    }


    function prx(val, useConsole) {
        var method = useConsole ? console.log : alert;
        method(JSON.stringify(val));
    }




