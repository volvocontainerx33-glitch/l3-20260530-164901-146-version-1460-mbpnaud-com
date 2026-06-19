(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCatalogue() {
    var list = qs('[data-card-list]');
    if (!list) return;
    var cards = qsa('[data-card]', list);
    var input = qs('[data-filter-input]') || qs('[data-search-page-input]');
    var status = qs('[data-search-status]');
    var activeCategory = 'all';

    function currentQuery() {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
      var query = currentQuery();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = activeCategory === 'all' || category === activeCategory;
        var visible = matchText && matchCategory;
        card.classList.toggle('hidden-card', !visible);
        if (visible) shown += 1;
      });
      if (status) {
        status.textContent = query ? '搜索结果：' + shown : '精选影片';
      }
    }

    function sortCards(mode) {
      var sorted = cards.slice();
      if (mode === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      } else if (mode === 'views') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      if (params.get('q')) input.value = params.get('q');
      input.addEventListener('input', applyFilter);
    }

    qsa('[data-sort]').forEach(function (button) {
      button.addEventListener('click', function () {
        qsa('[data-sort]').forEach(function (b) { b.classList.remove('is-active'); });
        button.classList.add('is-active');
        sortCards(button.getAttribute('data-sort'));
        applyFilter();
      });
    });

    qsa('[data-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        qsa('[data-view]').forEach(function (b) { b.classList.remove('is-active'); });
        button.classList.add('is-active');
        list.classList.toggle('list-mode', button.getAttribute('data-view') === 'list');
      });
    });

    qsa('[data-filter-category]').forEach(function (button) {
      button.addEventListener('click', function () {
        qsa('[data-filter-category]').forEach(function (b) { b.classList.remove('is-active'); });
        button.classList.add('is-active');
        activeCategory = button.getAttribute('data-filter-category') || 'all';
        applyFilter();
      });
    });

    applyFilter();
  }

  function initPlayer() {
    var shell = qs('[data-player]');
    var video = qs('[data-player-video]');
    if (!shell || !video || typeof streamUrl === 'undefined') return;
    var sound = qs('[data-player-sound]');
    var full = qs('[data-player-fullscreen]');
    var toggles = qsa('[data-player-toggle]');
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      var result = video.play();
      if (result && result.catch) result.catch(function () {});
    }

    function toggle() {
      attach();
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    toggles.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      });
    });

    video.addEventListener('click', function () {
      toggle();
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    if (sound) {
      sound.addEventListener('click', function () {
        video.muted = !video.muted;
        sound.textContent = video.muted ? '开声' : '静音';
      });
    }

    if (full) {
      full.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }

    attach();

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCatalogue();
    initPlayer();
  });
})();
