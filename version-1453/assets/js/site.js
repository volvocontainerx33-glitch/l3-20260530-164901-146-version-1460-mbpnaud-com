(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || 'search.html';
        window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
      });
    });

    initHero();
    initFiltering();
    initPlayers();
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFiltering() {
    var liveSearch = document.querySelector('[data-live-search]');
    var cards = selectAll('.movie-card[data-search]');
    var buttons = selectAll('[data-filter]');
    var state = document.querySelector('[data-search-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var activeFilter = 'all';

    if (liveSearch) {
      liveSearch.value = query;
      liveSearch.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    if (cards.length && (liveSearch || buttons.length)) {
      apply();
    }

    function apply() {
      var value = liveSearch ? liveSearch.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var hay = card.getAttribute('data-search') || '';
        var kind = card.getAttribute('data-kind') || '';
        var matchedText = !value || hay.indexOf(value) !== -1;
        var matchedKind = activeFilter === 'all' || kind.split(' ').indexOf(activeFilter) !== -1;
        var shown = matchedText && matchedKind;
        card.style.display = shown ? '' : 'none';
        if (shown) {
          visible += 1;
        }
      });

      if (state) {
        state.textContent = visible ? '已为你呈现匹配内容' : '没有找到匹配内容';
      }
    }
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (root) {
      var video = root.querySelector('video');
      var button = root.querySelector('[data-player-button]');
      var message = root.querySelector('[data-player-message]');
      var source = root.getAttribute('data-source');
      var hlsInstance = null;
      var loaded = false;

      if (!video || !source) {
        return;
      }

      function setMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.toggle('is-visible', Boolean(text));
      }

      function play() {
        if (!loaded) {
          loaded = true;
          video.controls = true;

          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                setMessage('点击画面继续播放');
              });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage('当前线路暂时繁忙，请稍后再试');
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
              video.play().catch(function () {
                setMessage('点击画面继续播放');
              });
            }, { once: true });
          } else {
            video.src = source;
            video.play().catch(function () {
              setMessage('点击画面继续播放');
            });
          }
        } else {
          video.play().catch(function () {
            setMessage('点击画面继续播放');
          });
        }

        if (button) {
          button.classList.add('is-hidden');
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        setMessage('');
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
