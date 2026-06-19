(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      button.textContent = open ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        restart();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  function renderSearchResult(movie) {
    return [
      '<a class="search-result-card" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<div>',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine || "") + '</p>',
      '<p>' + escapeHtml(movie.region || "") + ' · ' + escapeHtml(movie.year || "") + ' · ★ ' + escapeHtml(movie.rating || "") + '</p>',
      '</div>',
      '</a>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!form || !input || !results || !data.length) {
      return;
    }

    function search() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.classList.remove("is-visible");
        results.innerHTML = "";
        return;
      }
      var matched = data.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.category, movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 12);
      results.innerHTML = matched.map(renderSearchResult).join("");
      results.classList.toggle("is-visible", matched.length > 0);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      search();
    });
    input.addEventListener("input", search);
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var search = panel.querySelector("[data-filter-search]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var activeKey = "all";
    var activeValue = "all";

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") || "").toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesFilter = activeValue === "all" || (card.getAttribute("data-" + activeKey) || "") === activeValue;
        card.classList.toggle("is-hidden", !(matchesKeyword && matchesFilter));
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeKey = chip.getAttribute("data-filter-key") || "all";
        activeValue = chip.getAttribute("data-filter-value") || "all";
        apply();
      });
    });
    if (search) {
      search.addEventListener("input", apply);
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var start = player.querySelector("[data-player-start]");
      var source = player.getAttribute("data-video-url");
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (hlsInstance || video.getAttribute("src")) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        attachSource();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      attachSource();
      if (start) {
        start.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
    initPlayers();
  });
})();
