<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$file = __DIR__ . $uri;

if (is_file($file)) {
    return false; // serve existing files normally
}

if (is_file($file . '.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($file . '.html');
    exit;
}

return false;
