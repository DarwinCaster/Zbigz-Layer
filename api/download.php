<?php
$fid = intval($_GET['fid']);

function zipstate($hash, $data) {
  static $old_proc = 0;
  $ch = curl_init();
  curl_setopt_array($ch, array(
    CURLOPT_URL => 'http://' . $data['server'] . '/core/zipstate.php?hash=' . $hash . '&did=' . $data['did'] . '&_=' . time() . '000',
    CURLOPT_RETURNTRANSFER => 1
  ));
  $result = curl_exec($ch);
  $json = json_decode($result, true);
  curl_close($ch);
  if($json['proc'] > $old_proc) {
    set_time_limit(30);
    $old_proc = $json['proc'];
  }
  return $json['proc'] !== 100;
}

include '../php/api.php';

$result = api('/file/' . $_GET['hash'] . '/' . $_GET['fid'], array(
  CURLOPT_FOLLOWLOCATION => 0
), true);

if($fid == -1) {
  
  $data = json_decode($result, true);
  while(zipstate($_GET['hash'], $data)) {
    sleep(4);
  }
  $result = $data['zipLink'];
}

header('Location: ' . $result);

?>