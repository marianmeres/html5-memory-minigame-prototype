<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Diggy's Adventure Memory MiniGame</title>
    <link href="css/diggy/reset.css" rel="stylesheet">
    <link href="css/diggy/diggy.css" rel="stylesheet">
    <script src="js/diggy/?v=<?php echo substr(md5(uniqid()), 0, 4);?>"></script>
</head>
<body>

    <!-- quick-n-dirty -->
    <audio id='cell_select'>
        <source src="js/diggy/sound/click2.mp3" type="audio/mpeg" preload="auto" >
        <source src="js/diggy/sound/click2.ogg" type=’audio/ogg; codecs="vorbis"’>
    </audio>
    <audio id='cell_pair'>
        <source src="js/diggy/sound/click.mp3" type="audio/mpeg" preload="auto" >
        <source src="js/diggy/sound/click.ogg" type=’audio/ogg; codecs="vorbis"’>
    </audio>
    <audio id='cell_fall'>
        <source src="js/diggy/sound/fall.mp3" type="audio/mpeg" preload="auto" >
        <source src="js/diggy/sound/fall.ogg" type=’audio/ogg; codecs="vorbis"’>
    </audio>

    <div id="gameBox">
        <canvas id="board"></canvas>
    </div>


    <pre id="debug"><code
        id="debugSpinner"></code> <code
        id="debugFps"></code> <code
        id="debugCursor"></code></pre>


<script>
    window.onload = function () {
        diggy.run({
            // prefs...
        });
    }

</script>

</body>
</html>
