<?php

include 'BDecode.php';
include 'BEncode.php';

function hash_from_torrent($path) {
  $content = @file_get_contents($path);
  $content_d = BDecode($content);

  # Check if bdecode succeeded
  if(empty($content_d))
    return false;

  # Calculate info_hash
  return sha1(BEncode($content_d['info']));
}

?>