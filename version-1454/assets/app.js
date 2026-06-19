(function () {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    start();
  }

  const filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    const input = filterScope.querySelector('[data-filter-input]');
    const typeSelect = filterScope.querySelector('[data-filter-type]');
    const genreSelect = filterScope.querySelector('[data-filter-genre]');
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const type = typeSelect ? typeSelect.value : '';
      const genre = genreSelect ? genreSelect.value : '';

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        const typeOk = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
        const genreOk = !genre || (card.getAttribute('data-genre') || '').indexOf(genre) !== -1;
        const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = typeOk && genreOk && keywordOk ? '' : 'none';
      });
    };

    [input, typeSelect, genreSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    apply();
  }
})();

function initMoviePlayer(streamUrl) {
  const video = document.getElementById('moviePlayer');
  const button = document.querySelector('[data-player-start]');

  if (!video || !streamUrl) {
    return;
  }

  let prepared = false;

  const loadScript = function () {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const prepare = function () {
    if (prepared) {
      return Promise.resolve();
    }
    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    return loadScript().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    });
  };

  const start = function () {
    prepare().then(function () {
      if (button) {
        button.classList.add('hidden');
      }
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    });
  };

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
}
