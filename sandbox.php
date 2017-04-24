<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Testing...</title>
    <link href="css/sandbox/sandbox.css" rel="stylesheet">
    <script src="js/sandbox/?v=<?php echo substr(md5(uniqid()), 0, 4);?>"></script>
</head>
<body>

    <div id="game">
        <canvas id="canvas">
            You have to upgrade your browser to play this game.
        </canvas>
    </div>

    <pre style="margin:0;"><code id="spinner"></code> <code id="csl"></code> <code id="fps"></code> <code id="cursor_xy"></code></pre>
    <div>move with arrows, <code>[esc]</code> toggles pause</div>


<script>
    window.onload = function () {
        sandbox.run({
            width: 640,
        });
    }

</script>

</body>
</html>
