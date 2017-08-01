<?php
header('Content-Type: application/json');

include '../php/api.php';

api('/delete&hash=' . $_GET['hash'] . '&confirm=y');

echo json_encode(array(
  'hash' => $_GET['hash']
));
?>