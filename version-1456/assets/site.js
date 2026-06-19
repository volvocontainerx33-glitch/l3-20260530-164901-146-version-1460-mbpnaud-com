(function () {
    function bindNavigation() {
        const toggle = document.querySelector('.mobile-toggle');
        const nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function bindHero() {
        const slides = Array.from(document.querySelectorAll('.hero-slide'));
        const dots = Array.from(document.querySelectorAll('.hero-dot'));
        if (!slides.length || !dots.length) {
            return;
        }
        let index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function bindFilters() {
        const panels = Array.from(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            const root = panel.parentElement || document;
            const search = panel.querySelector('.movie-search');
            const year = panel.querySelector('.year-filter');
            const type = panel.querySelector('.type-filter');
            const cards = Array.from(root.querySelectorAll('.movie-card'));
            function apply() {
                const q = (search && search.value ? search.value : '').trim().toLowerCase();
                const y = year && year.value ? year.value : '';
                const t = type && type.value ? type.value : '';
                cards.forEach(function (card) {
                    const haystack = [
                        card.dataset.title || '',
                        card.dataset.region || '',
                        card.dataset.type || '',
                        card.dataset.genre || '',
                        card.dataset.year || ''
                    ].join(' ').toLowerCase();
                    const matched = (!q || haystack.indexOf(q) !== -1) && (!y || card.dataset.year === y) && (!t || card.dataset.type === t);
                    card.classList.toggle('is-hidden', !matched);
                });
            }
            if (search) {
                search.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            if (type) {
                type.addEventListener('change', apply);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindNavigation();
        bindHero();
        bindFilters();
    });
})();

function initMoviePlayer(source) {
    document.addEventListener('DOMContentLoaded', function () {
        const video = document.getElementById('movie-video');
        const overlay = document.getElementById('player-overlay');
        if (!video || !source) {
            return;
        }
        let loaded = false;
        function start() {
            if (overlay) {
                overlay.classList.add('hidden');
            }
            if (!loaded) {
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = source;
            }
            video.play().catch(function () {});
        }
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                start();
            }
        });
    });
}
