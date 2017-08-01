<?php
function login() {
  @include '../data/settings.php';
  if(isset($log) && $log === true)
    file_put_contents('../data/logs', @date('Y-m-d H:i:s', time())."\n", FILE_APPEND|LOCK_EX);
  include '../data/login_data.php';
  $ch = curl_init();
  curl_setopt_array($ch, array(
    CURLOPT_POST => 1,
    CURLOPT_URL => 'http://m.zbigz.com/login.php',
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_POSTFIELDS => http_build_query($login_data),
    CURLOPT_COOKIEJAR => dirname(__FILE__) . '/../data/cookies',
    CURLOPT_FOLLOWLOCATION => 0
  ));
  curl_exec($ch);
  $redirect_url = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
  curl_close($ch);
  return end(explode('/', $redirect_url)) === 'myfiles';
}
?>