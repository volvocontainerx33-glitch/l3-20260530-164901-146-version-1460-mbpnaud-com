(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var target = targetSelector ? document.querySelector(targetSelector) : document;
            if (!target) {
                return;
            }
            var input = panel.querySelector("[data-filter-input]");
            var category = panel.querySelector("[data-filter-category]");
            var year = panel.querySelector("[data-filter-year]");
            var sort = panel.querySelector("[data-sort-select]");
            var cards = Array.prototype.slice.call(target.querySelectorAll("[data-filter-card]"));
            var empty = document.querySelector(panel.getAttribute("data-empty-target") || "");

            function apply() {
                var q = normalize(input ? input.value : "");
                var cat = normalize(category ? category.value : "");
                var yearValue = normalize(year ? year.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" "));
                    var sameCategory = !cat || normalize(card.getAttribute("data-category")) === cat;
                    var sameYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matched = (!q || text.indexOf(q) !== -1) && sameCategory && sameYear;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            function reorder() {
                if (!sort || !target) {
                    return;
                }
                var value = sort.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (value === "rating") {
                        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                    }
                    if (value === "year") {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    }
                    return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-CN");
                });
                sorted.forEach(function (card) {
                    target.appendChild(card);
                });
                cards = sorted;
                apply();
            }

            [input, category, year].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });

            if (sort) {
                sort.addEventListener("change", reorder);
            }

            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
