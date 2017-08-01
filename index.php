<?php
header('Content-Type: text/html; charset=utf-8');

// This is to check if the request is coming from a specific domain
include('data/settings.php');
if($checkReferer) {
  $ref = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
  $refData = @parse_url($ref);
  if($ref === '' || $refData['host'] !== $refererHost) {
    // Output string and stop execution
    die('Hotlinking not permitted, access this page from ' . $refererHost);
  }
}
?>
<!doctype html>
<html>
  <head>
    <title>Torrent to HTTP</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
    <script type="text/javascript">
      var maxFiles = <?php echo $maxFiles ?>;
    </script>
    <script type="text/javascript" src="resources/main.js?ts=<?php echo filemtime('resources/main.js'); ?>"></script>
    <link rel="stylesheet" type="text/css" href="resources/style.css?ts=<?php echo filemtime('resources/style.css'); ?>">
    <style id="filter-css"></style>
    <?php @include('custom/head.html'); ?>
  </head>
  <body>
    <div id="loading" class="hide">
      <i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
      <span class="sr-only">Loading...</span>
    </div>
    <div id="container">
      <?php @include('custom/1.html'); ?>
      <form id="upload" onsubmit="return false">
        <input type="text" name="url" placeholder="Enter torrent or magnet link here">
        <input type="file" name="file"><i class="fa fa-file fa-fw" title="Select torrent file"></i>
        <i class="fa fa-upload fa-fw" title="Upload"><button class="hide"></button></i>
      </form>
      <?php @include('custom/2.html'); ?>
      <div id="filter-box">
        <input type="text" name="filter" id="filter" placeholder="Filter torrents by name">
      </div>
      <?php @include('custom/3.html'); ?>
      <div id="torrent-list">
        <div id="template" class="torrent" data-title=""> <!-- class="mine" class="downloaded" -->
          <div class="name">&gt;new torrent&lt;</div>
          <div>
            <progress max="100" value="0"></progress>
            <div class="stats-box">
              <div class="stats">
                <span class="size">???B</span>
                <span class="state"></span>
                <span class="speed"></span>
              </div>
              <a class="playlist"><i class="fa fa-play fa-fw" title="Playlist"></i></a>
              <a class="download"><i class="fa fa-download fa-fw" title="Download"></i></a>
              <i class="fa fa-times fa-fw" title="Delete"></i>
            </div>
          </div>
          <div class="files">
            <div id="template_file" class="file">
              <div class="name">---</div>
              <div class="size">---</div>
              <a class="download"><i class="fa fa-download fa-fw" title="Download"></i></a>
            </div>
          </div>
        </div>
      </div>
      <?php @include('custom/4.html'); ?>
    </div>
    <div id="deleted"><i class="fa fa-spinner fa-pulse fa-fw"></i></div>
    <script type="text/javascript" src="resources/onload.js?ts=<?php echo filemtime('resources/onload.js'); ?>"></script>
  </body>
</html>