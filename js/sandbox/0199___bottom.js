
    // import needed "externals" to local scope
    var mm = window.mm, dom = window.dom, util = window.util;

    // few "global" objects (as few as possible)
    var config, game, renderer, cursor, dic = new Dic();

    // misc app constants
    var KEY = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ESC: 27//, A: 65
    };

    // config may be also extended at run time with provided spec
    config = mm.extend({}, {
        width:    300,
        height:   300,
        canvasId: 'canvas',
        controls: {},
    });

    // mapa kontrol klaves a ich handlerov
    config.controls[KEY.LEFT]  = "handleLeft";
    config.controls[KEY.UP]    = "handleUp";
    config.controls[KEY.RIGHT] = "handleRight";
    config.controls[KEY.DOWN]  = "handleDown";
    config.controls[KEY.ESC]   = "togglePause";
    config.controls["click"]   = "handleClick";
    // config.controls["touch"]   = "handleClick";

    /**
     *
     */
    function init(prefs) {
        mm.extend(config, prefs || {});

        // define dependency (dic) stuff here (tu iba akoze)
        dic.share("fpsStats", function() {return new FpsStats()});
        dic.set("controls",   function() {return Controls});

        // instantiate main app objects
        game     = new Game(config, dic);
        renderer = new Renderer(config, game, dic);
        cursor   = new Cursor(config, renderer.canvas);
    }

    /**
     *
     */
    function run() {
        return cycle(game, renderer, dic.get("fpsStats"));
    }

    /**
     * public api
     */
    return {
        run: function (prefs) {
            init(prefs);
            run();
        }
    }

})(window);