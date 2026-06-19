(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
      dot.setAttribute('aria-selected', dotIndex === activeIndex ? 'true' : 'false');
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-movie-filter]');
  var filterButton = document.querySelector('[data-filter-button]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter() {
    if (!filterInput || !cards.length) {
      return;
    }

    var query = normalize(filterInput.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var source = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matched = !query || source.indexOf(query) !== -1;
      card.hidden = !matched;

      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      filterInput.value = q;
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (filterButton) {
    filterButton.addEventListener('click', applyFilter);
  }
})();
