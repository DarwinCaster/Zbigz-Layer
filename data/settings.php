<?php
// you can allow access only from your website
// just change $checkReferer to true and set $refererHost
// eg. host for http://www.example.com/index.html is www.example.com
$checkReferer = false;
$refererHost = '';

// max files user can add, 0 (or any negative number) means there is no limit
$maxFiles = 0;

// log all logins to data/logs
$log = true;
?>