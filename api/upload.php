<?php
header('Content-Type: application/json');

function fail($code, $message) {
  echo json_encode(array(
    'error' => $code,
    'result' => $message
  ));
  exit(0);
}

$type = 'torrent';
if($_FILES['file']['size'] > 0) {
  // .torrent file was sent
  $file = true;
  $path = $_FILES['file']['tmp_name'];
}
else {
  // magnet or url to .torrent file was sent
  $file = false;
  $path = $_POST['url'];
  if(strpos($path, 'magnet:') !== false)
    $type = 'magnet';
  elseif(strpos($path, '://') == false)
    fail(1, 'bad url');
}

if($type == 'torrent') {
  // path or url to .torrent file
  require '../php/hash_from_torrent.php';
  $hash = hash_from_torrent($path);
  if($hash === false)
    fail(2, 'could not load torrent, try magnet link');
}
else {
  // magnet link
  parse_str(str_replace('tr=','tr[]=',parse_url($path,PHP_URL_QUERY)),$query);
  $hash = str_replace('urn:btih:', '', $query['xt']);
  if(strlen($hash) == 32) {
    // sometimes there is base32 hash instead of base16
    $old_hash = $hash;
    require '../php/base32_to_base16.php';
    $hash = base32_to_base16($hash);
    $_POST['url'] = str_replace($old_hash, strtolower($hash), $path);
  }
}
$hash = strtolower($hash);

$post = $_POST;
if($file) {
  if(function_exists('curl_file_create')) // php 5.5+
    $post['file'] = curl_file_create($_FILES['file']['tmp_name']);
  else
    $post['file'] = '@' . realpath($_FILES['file']['tmp_name']);
}

include '../php/api.php';

$result = api('/myfiles', array(
  CURLOPT_POST => 1,
  CURLOPT_POSTFIELDS => $post
));

$dom = new DOMDocument();
@$dom->loadHTML($result);
$finder = new DomXPath($dom);
$server = $finder->query('//div[@id="' . $hash . '"]/@data-server');

if($server->length == 0) {
  if(strpos($a, 'The number of concurrent active torrents is limited.') !== false)
    fail(4, 'Max number of active torrents reached. Try again later.');
  else
    fail(3, 'torrent not found');
}

echo json_encode(array(
  'error' => '',
  'hash' => $hash,
  'server' => $server->item(0)->textContent
));
?>