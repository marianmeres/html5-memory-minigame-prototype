//

    // import needed "externals" to local scope
    var mm = window.mm, dom = window.dom, util = window.util;

    // few "global" objects (as few as possible)
    var config, game, renderer, dic = new Dic(); //canvas,

    // misc app constants
    var KEY = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ESC: 27
    };

    // config may be also extended at run time with provided prefs
    config = mm.extend({}, {
        width:       540,
        height:      540,
        canvasId:    'board',
        controls:     {},
        cell:         {w: 60, h: 60},
        board:        {w: 5,  h: 5}, // rows, cols
        assets: { // assets to be preloaded
            sprite: "js/diggy/img/sprite.png",
        },
        images: {}, // to be set at runtime (at preload callback)
    });

    // mapa kontrol klaves a ich handlerov
    config.controls[KEY.LEFT]  = "handleLeft";
    config.controls[KEY.UP]    = "handleUp";
    config.controls[KEY.RIGHT] = "handleRight";
    config.controls[KEY.DOWN]  = "handleDown";
    config.controls["click"]   = "handleClick";
    config.controls[KEY.ESC]   = "handlePause";

    /**
     *
     */
    function init(prefs) {
        mm.extend(config, prefs || {});

        // tu si nadefinujeme (lazy) vsetky zavislosti... i ked realny zmysel
        // pri tejto aplikacii sa blizi nule, myslim, ze to vynuti
        // best practices z pohladu testovania (realny overhead dic je nula cela nic)

        dic.share("config",   config);
        dic.share("canvas",   dom.get(config.canvasId));
        dic.share("cursor",   function(dic){ return new Cursor(dic)});
        dic.share("fpsStats", function(dic){ return new FpsStats()});
        dic.share("game",     function(dic){ return new Game(dic)});
        dic.share("renderer", function(dic){ return new Renderer(dic, dic.get("game"))});

        dic.share("board",    function(){return Board}); // toto vracia constructor
        dic.share("cell",     function(){return Cell}); // toto vracia constructor
        dic.share("controls", function(){return Controls}); // toto vracia constructor
    }

    // zatial len nastrel
    function loadAssets(callback) {
        var imgMap = {}, sounds = {}, assets = config.assets;

        // rozdelime si to na dielcie veci...
        for (var i in assets) {
            if (/.+\.(jpg|png|gif)$/i.test(assets[i])) {
                imgMap[i] = assets[i];
            }
            // else if mp3, ogg todo
        }

        loadImages(imgMap, callback);
    }

    /**
     * load multiple images and callback when ALL images have loaded
     */
    function loadImages(map, callback) {
        var result = {}, img, count = 0;

        // kolko ich bude... @todo: toto nejde rozumnejsie?
        for (var i in map) {count++;}

        var onload = function() {
            if (--count == 0) {
                config.images = result;
                callback();
            }
        };

        for (var n in map) {
            img = document.createElement('img');
            dom.on(img, 'load', onload);
            img.src = map[n];
            result[n] = img;
        }
    }

    /**
     *
     */
    function run() {
        dic.get("cursor");
        cycle(dic.get("game"), dic.get("renderer"), dic.get("fpsStats"));
    }

    /**
     * public api
     */
    return {
        run: function (prefs) {
            init(prefs);
            loadAssets(run);
            // run();
        }
    }

})(window);