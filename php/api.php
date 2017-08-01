<?php
include '../php/login.php';
function api($pathname, $curl_options=array(), $download=false) {
  $curl_options += array(
    CURLOPT_URL => 'http://' . ($download ? '' : 'm.') . 'zbigz.com' . $pathname,
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_COOKIEFILE => dirname(__FILE__) . '/../data/cookies',
    CURLOPT_AUTOREFERER => 1,
    CURLOPT_FOLLOWLOCATION => 1
  );
  for($i=0; $i<3; ++$i) {
    $ch = curl_init();
    curl_setopt_array($ch, $curl_options);
    $result = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $redirect_url = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    curl_close($ch);
    if($download) {
      if($httpcode === 302)
        return $redirect_url;
      elseif($httpcode === 200)
        break;
    }
    elseif(strpos($result, 'fa-user') !== false) {
      break;
    }

    if(!login()) {
      http_response_code(401);
      echo 'Unauthorized';
      exit();
    }
  }
  if($download && $httpcode === 404) {
    http_response_code(404);
    echo 'File not found';
    exit();
  }
  return $result;
}
?>