const hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";

let hlsLoadPromise = null;

function loadHls() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  if (!hlsLoadPromise) {
    hlsLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = hlsUrl;
      script.async = true;
      script.onload = () => resolve(window.Hls);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return hlsLoadPromise;
}

function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll(".hero-dot"));

  if (slides.length < 2) {
    return;
  }

  let index = 0;

  const show = (next) => {
    index = (next + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
  };

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => show(i));
  });

  setInterval(() => {
    show(index + 1);
  }, 5200);
}

function cardText(card) {
  return [
    card.dataset.title || "",
    card.dataset.region || "",
    card.dataset.type || "",
    card.dataset.year || "",
    card.dataset.genre || "",
    card.dataset.tags || ""
  ].join(" ").toLowerCase();
}

function setupFilters() {
  const scopes = document.querySelectorAll("[data-filter-scope]");

  scopes.forEach((scope) => {
    const input = scope.querySelector("[data-search-input]");
    const select = scope.querySelector("[data-filter-select]");
    const chips = Array.from(scope.querySelectorAll("[data-filter-chip]"));
    const cards = Array.from(scope.querySelectorAll("[data-card]"));
    const empty = scope.querySelector("[data-empty]");
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    let activeChip = "all";

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : "";
      const selected = select ? select.value : "all";
      let visible = 0;

      cards.forEach((card) => {
        const text = cardText(card);
        const chipPass = activeChip === "all" || text.includes(activeChip.toLowerCase());
        const selectPass = selected === "all" || text.includes(selected.toLowerCase());
        const queryPass = !query || text.includes(query);
        const keep = chipPass && selectPass && queryPass;

        card.classList.toggle("is-hidden-card", !keep);

        if (keep) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    if (select) {
      select.addEventListener("change", apply);
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeChip = chip.dataset.filterChip || "all";

        chips.forEach((item) => {
          item.classList.toggle("is-active", item === chip);
        });

        apply();
      });
    });

    apply();
  });
}

function setupPlayers() {
  const players = document.querySelectorAll("[data-player]");

  players.forEach((box) => {
    const video = box.querySelector("video");
    const overlay = box.querySelector(".play-overlay");
    const stream = box.getAttribute("data-stream");

    if (!video || !stream) {
      return;
    }

    let ready = false;
    let hlsInstance = null;

    const prepare = async () => {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }

      try {
        const Hls = await loadHls();

        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      } catch (error) {
        video.src = stream;
      }
    };

    const start = async () => {
      overlay?.classList.add("is-hidden");

      await prepare();

      try {
        await video.play();
      } catch (error) {
      }
    };

    overlay?.addEventListener("click", start);

    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", () => {
      overlay?.classList.add("is-hidden");
    });

    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupHero();
  setupFilters();
  setupPlayers();
});
