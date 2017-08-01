var mediaExtensions = ['3g2', '3gp', 'aac', 'aiff', 'amr', 'amv', 'ape', 'asf', 'au', 'avi', 'flac', 'flv', 'm4a', 'm4b', 'm4p', 'm4v', 'mkv', 'mov', 'mp2', 'mp3', 'mp4', 'mpc', 'mpe', 'mpeg', 'mpg', 'mpv', 'mxf', 'nsv', 'oga', 'ogg', 'ogv', 'rm', 'rmvb', 'svi', 'tta', 'vob', 'wav', 'webm', 'wma', 'wmv', 'wv'];

(function(self) {
  var queue = [];
  self.addToQueue = function(data, urgent) {
    /*
    {
      url
      method: optional, defaults to get
      data: optional, used with post
      callback(res): optional, do stuff with res.response
      type: optional, response type
      withCredentials: optional
    }
    */
    if(typeof data.method === 'undefined')
      data.method = 'get';
    if(typeof data.type === 'undefined')
      data.type = '';
    if(typeof data.callback === 'undefined')
      data.callback = function() {};
    if(typeof data.data === 'undefined')
      data.data = null;
    if(data.url.indexOf('://') > -1)
      data.withCredentials = false;
    if(urgent === true)
      queue.unshift(data);
    else
      queue.push(data);
  };
  async function xhr(data) {
    return new Promise(function(resolve) {
      var req = new XMLHttpRequest();
      req.responseType = data.type;
      if(typeof data.withCredentials === 'boolean')
        req.withCredentials = data.withCredentials;
      req.open(data.method, data.url);
      req.onload = function(e) {
        resolve(e.target);
      };
      req.onerror = function() {
        throw new Error('xhr failed');
      };
      req.send(data.data);
    });
  };
  async function processQueue() {
    var data = queue.shift();
    if(typeof data !== 'undefined') {
      try {
        let res = await xhr(data);
        if(res.status == 401) {
          alert("Bad password or premium ended, contact admin and try again later");
          return;
        }
        else
          data.callback(res);
      }
      catch(e) {
        if(e.message == 'xhr failed')
          window.setTimeout(addToQueue, 10000, data);
        else
          throw e;
      }
      window.setTimeout(processQueue, 0);
    }
    else
      window.setTimeout(processQueue, 500);
  }
  processQueue();
})(this);

function normaliseFilter(text) {
  if(!text)
    return '';
  text = text.toLocaleLowerCase();
  text = text.replace(/\\$/, ''); // remove trailing backslash
  text = text.replace(/"/g, '\\"'); // escape quotes
  text = text.replace(/[._]/g, ' '); // change common word separator characters to spaces
  text = text.replace(/\s+/g, ' '); // normalise whitespaces
  return text.trim();
}
function filter() {
  var items = document.querySelectorAll('#torrent-list>.torrent:not(#template)');
  var filter = normaliseFilter(this.value);
  var css = filter ? '.torrent:not([data-name*="' + filter + '"]) { display: none; }' : '';
  document.querySelector('#filter-css').innerHTML = css;
}

function formatSize(bytes) {
  var sizes = ['', 'K', 'M', 'G', 'T'];
  for(var i=0; bytes/1024 > 1 && i < 4; ++i, bytes/=1024);
  return bytes.toFixed(1) + sizes[i] + 'B';
}
function formatSpeed(bytes) {
  return formatSize(bytes) + '/s';
}

function createDownloadURL(hash, fid, name) {
  var nameQuery = typeof name === 'undefined' ? '' : '&name=' + encodeURIComponent(name);
  return 'api/download.php?hash=' + hash + '&fid=' + fid + nameQuery;
}

function addFile(torrent, data) {
  var file = document.querySelector('#template_file').cloneNode(true);
  file.removeAttribute('id');
  file.setAttribute('data-fid', data.fid);
  var name = data.file_path.split('/').slice(1).join('/');
  file.querySelector('.download').href = createDownloadURL(torrent.id, data.fid, name);
  file.querySelector('.name').innerHTML = name;
  file.querySelector('.size').innerHTML = formatSize(data.file_size);
  torrent.querySelector('.files').appendChild(file);
  return file;
}

function updateTorrent(data, new_) {
  var torrent, server, timeout;
  if(new_ === true) {
    if(document.getElementById(data.hash) !== null) {
      alert('torrent already added');
      return;
    }
    timeout = 100;
    torrent = document.querySelector('#template').cloneNode(true);
    server = data.server;
    torrent.id = data.hash;
    torrent.setAttribute('data-server', data.server);
    torrent.querySelector('.download').href = createDownloadURL(data.hash, '-1');
    torrent.querySelector('.playlist').href = 'http://m.zbigz.com/playlist.php?hash=' + data.hash + '&playlist.m3u8';
  }
  else {
    timeout = 10000;
    torrent = document.getElementById(data.hash);
    if(torrent === null)
      return; // torrent deleted
    server = torrent.getAttribute('data-server');
  }
  if(data.state) {
    torrent.querySelector('.state').innerHTML = data.state;
    torrent.querySelector('progress').value = data.progress;
    torrent.querySelector('.speed').innerHTML = formatSpeed(data.dr);
    if(!torrent.classList.contains('metadata') && data.has_metadata) {
      torrent.setAttribute('data-name', normaliseFilter(data.name));
      torrent.classList.add('metadata');
      torrent.querySelector('.name').innerHTML = data.name;
      torrent.querySelector('.size').innerHTML = formatSize(data.size);
    }
  }

  if(data.files) {
    let mediafiles = torrent.classList.contains('mediafiles');
    if(data.files.length > 1) {
      torrent.classList.add('multiple-files');
      data.files.forEach(function(file) {
        var file_div = torrent.querySelector('[data-fid="' + file.fid + '"]');
        if(file_div == null) {
          file_div = addFile(torrent, file);
          if(!mediafiles && mediaExtensions.indexOf(file.file_path.split('.').pop()) > -1) {
            mediafiles = true;
            torrent.classList.add('mediafiles');
          }
        }
        if(file.file_size == file.d_bytes) {
          file_div.classList.add('downloaded');
        }
      });
    }
    else {
      if(!mediafiles && mediaExtensions.indexOf(data.name.split('.').pop()) > -1)
        torrent.classList.add('mediafiles');
      torrent.querySelector('.download').href = createDownloadURL(data.hash, '0');
    }
  }

  if(data.state == 'seeding')
    torrent.classList.add('downloaded');
  else
    window.setTimeout(queueTorrentInfoCheck, timeout, data.hash, server);

  if(new_ === true) {
    if(data.mine)
      torrent.classList.add('mine');
    document.querySelector('#torrent-list').appendChild(torrent);
  }
  if(myTorrents.indexOf(data.hash) === -1) {
    myTorrents.push(data.hash);
    localStorage.setItem('my-torrents', JSON.stringify(myTorrents));
  }
  var torrentInfo = JSON.parse(localStorage.getItem(data.hash) || '{}');
  torrentInfo = Object.assign(torrentInfo, data);
  localStorage.setItem(data.hash, JSON.stringify(torrentInfo));
}
function addTorrent(data) {
  updateTorrent(data, true);
}

function updateTorrentInfo(res) {
  var data = res.response;
  if(data.error == "") {
    updateTorrent(data);
  }
  else {
    alert('something went wrong, reloading page');
    document.location.reload();
  }
}

function queueTorrentInfoCheck(hash, server, more) {
  addToQueue({
    url: 'http://' + server + '/gate/status?l=1&hash=' + hash,
    type: 'json',
    callback: updateTorrentInfo
  });
}

function upload(res) {
  var data = res.response;
  if(!data) {
    console.log(res.responseText);
    return;
  }
  if(data.error == '') {
    data.mine = true;
    addTorrent(data);
  }
  else
    alert('ERROR ' + data.error + ': ' + data.result);
  document.querySelector('#loading').classList.add('hide');
}

function deleteTorrent(res) {
  var hash = res.response.hash,
      torrent = document.getElementById(hash),
      index = myTorrents.indexOf(hash);
  if(index > -1) {
    myTorrents.splice(index, 1);
    localStorage.setItem('my-torrents', JSON.stringify(myTorrents));
  }
  localStorage.removeItem(hash);
  torrent.parentNode.removeChild(torrent);
}

function torrentListClick(e) {
  var element = torrent = e.target;
  while(!torrent.classList.contains('torrent')) {
    torrent = torrent.parentNode;
  }
  if(element.title == 'Delete') {
    if(confirm('Are you sure you want to delete this torrent?')) {
      document.querySelector('#deleted').appendChild(torrent);
      addToQueue({
        url: 'api/delete.php?hash=' + torrent.id,
        type: 'json',
        callback: deleteTorrent
      }, true);
    }
  }
  else if(element.classList.contains('name') && torrent.classList.contains('multiple-files') && element.parentNode == torrent)
    torrent.classList.toggle('expand');
}