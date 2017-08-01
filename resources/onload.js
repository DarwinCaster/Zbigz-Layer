var myTorrents = JSON.parse(localStorage.getItem('my-torrents') || '[]');
myTorrents.forEach(function(hash) {
  var torrentInfo = JSON.parse(localStorage.getItem(hash));
  addTorrent(torrentInfo);
});

(function() {

  var uploadBox = document.querySelector('#upload'),
      fileInput = uploadBox.querySelector('input[type=file]'),
      fileButton = uploadBox.querySelector('.fa-file'),
      urlInput = uploadBox.querySelector('input[type=text]'),
      uploadButton = uploadBox.querySelector('.fa-upload');

  fileInput.addEventListener('change', function() {
    urlInput.value = this.value.replace('C:\\fakepath\\', '');
  });

  fileButton.addEventListener('click', function() {
    fileInput.click();
  });

  uploadButton.addEventListener('click', function() {
    if(maxFiles > 0 && myTorrents.length >= maxFiles) {
      alert('Too many torrents added, delete some of them.');
      return;
    }
    var FD = new FormData(uploadBox);
    if(!FD.get('file')) {
      let url = FD.get('url');
      if(url.indexOf('magnet:') == -1 && url.indexOf('://') == -1) {
        alert('Select file or enter url/magnet first');
        return;
      }
    }
    document.querySelector('#loading').classList.remove('hide');
    addToQueue({
      method: 'post',
      url: 'api/upload.php',
      data: FD,
      type: 'json',
      callback: upload
    }, true);
    uploadBox.reset();
  });

  document.querySelector('#filter').addEventListener('keyup', filter);

  document.querySelector('#torrent-list').addEventListener('click', torrentListClick);
})();