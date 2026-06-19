(function () {
  function startPlayer(video, cover) {
    if (!video) {
      return;
    }

    if (cover) {
      cover.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById('moviePlayer');
    var cover = document.getElementById('moviePlayButton');

    if (!video || !sourceUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }

    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(video, cover);
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayer(video, cover);
      }
    });
  };
})();
