<?php
/**
 * Toto zatial len "concatenate"-uje vsetky *.$type subory v tomto adresari.
 *
 * @author Marian Meres
 */

define("APPLICATION_ENV", "development");

// config
$type          = "js";
$cacheFile     = "_build.$type";
$cacheFilePath = __DIR__ . "/$cacheFile";
$replaceMap    = __DIR__ . "/replace-map.php";
$versionFile   = __DIR__ . "/version.txt";
$contentTypes  = array(
    "js" => "text/javascript", "css" => "text/css"
);
$contentType   = $contentTypes[$type];


// na produkcii rovno optimisticky von
if ('production' == APPLICATION_ENV && file_exists($cacheFilePath)) {
    serve(file_get_contents($cacheFilePath), $contentType);
    exit;
}

// inak concat *.css
$out = '';
foreach (glob("*.$type") as $file) {
    if ($cacheFile == substr($file, -strlen($cacheFile))) {
        continue;
    }
    $out .= trim(file_get_contents($file)) . "\n\n";
}

// a von
serve(process($out, $replaceMap), $contentType);
exit;

////////////////////////////////////////////////////////////////////////////////

// processor + cache writer
function process($string, $replaceMap = null)
{
    global $cacheFilePath, $versionFile, $type;

    if (is_string($replaceMap)) { // string povazujeme za php file
        $replaceMap = include $replaceMap;
    }

    if (is_array($replaceMap) && !empty($replaceMap)) {
        $string = str_replace(array_keys($replaceMap), array_values($replaceMap), $string);
    }

    $string     = trim($string);
    $version = substr(md5($string), 0, 6) . ".$type";

    file_put_contents($cacheFilePath, "/*cached:$version*/\n\n$string");
    file_put_contents($versionFile, $version);

    return $string;
}

// headers + echo
function serve($string, $contentType = "text/plain")
{
    header("Content-type: $contentType");
    header("Content-Length: " . strlen($string));
    header("Expires: " . date('r', (time()+31536000))); // 60*60*24*365
    header("Cache-Control: max-age=" . 31536000);       // 60*60*24*365
    header("Last-Modified: " . date("r"));
    header(sprintf('Etag: "%s"', md5($string)));
    echo $string;
}