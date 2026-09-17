/* ==========================================================================
   TravelBloom — Shared JavaScript
   Search, hamburger menu, contact form validation, local time
   ========================================================================== */

'use strict';

/* ---------- Country → IANA Timezone Lookup ---------- */
const TIMEZONE_MAP = {
  'australia': 'Australia/Sydney',
  'japan': 'Asia/Tokyo',
  'brazil': 'America/Sao_Paulo',
  'france': 'Europe/Paris',
  'italy': 'Europe/Rome',
  'united arab emirates': 'Asia/Dubai',
  'turkey': 'Europe/Istanbul',
  'thailand': 'Asia/Bangkok',
  'spain': 'Europe/Madrid',
  'united kingdom': 'Europe/London',
  'pakistan': 'Asia/Karachi',
  'united states': 'America/New_York',
  'usa': 'America/New_York',
  'uae': 'Asia/Dubai',
  'canada': 'America/Toronto'
};

/* City-specific timezone overrides for accuracy */
const CITY_TIMEZONE_MAP = {
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'brisbane': 'Australia/Brisbane',
  'perth': 'Australia/Perth',
  'tokyo': 'Asia/Tokyo',
  'kyoto': 'Asia/Tokyo',
  'osaka': 'Asia/Tokyo',
  'nara': 'Asia/Tokyo',
  'rio de janeiro': 'America/Sao_Paulo',
  'são paulo': 'America/Sao_Paulo',
  'salvador': 'America/Bahia',
  'paris': 'Europe/Paris',
  'nice': 'Europe/Paris',
  'lyon': 'Europe/Paris',
  'rome': 'Europe/Rome',
  'venice': 'Europe/Rome',
  'florence': 'Europe/Rome',
  'milan': 'Europe/Rome',
  'dubai': 'Asia/Dubai',
  'abu dhabi': 'Asia/Dubai',
  'istanbul': 'Europe/Istanbul',
  'cappadocia': 'Europe/Istanbul',
  'antalya': 'Europe/Istanbul',
  'bangkok': 'Asia/Bangkok',
  'phuket': 'Asia/Bangkok',
  'chiang mai': 'Asia/Bangkok',
  'barcelona': 'Europe/Madrid',
  'madrid': 'Europe/Madrid',
  'seville': 'Europe/Madrid',
  'london': 'Europe/London',
  'edinburgh': 'Europe/London',
  'liverpool': 'Europe/London',
  'lahore': 'Asia/Karachi',
  'islamabad': 'Asia/Karachi',
  'karachi': 'Asia/Karachi',
  'hunza': 'Asia/Karachi',
  'new york city': 'America/New_York',
  'new york': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
  'san francisco': 'America/Los_Angeles',
  'las vegas': 'America/Los_Angeles',
  'toronto': 'America/Toronto'
};

/* Stem map: maps plural forms → singular category keyword */
const STEM_MAP = {
  'beaches': 'beach',
  'temples': 'temple',
  'countries': 'country',
  'mosques': 'mosque'
};

/* Category keyword → JSON key */
const CATEGORY_KEY_MAP = {
  'beach': 'beaches',
  'temple': 'temples',
  'country': 'countries',
  'mosque': 'mosques'
};

/* ---------- Global Data Store ---------- */
let travelData = null;

/* ---------- DOM References ---------- */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Hamburger Menu ---- */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const BREAKPOINT = 900;

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);

    /* Close on link click */
    menuLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    /* Close on Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
        hamburgerBtn.focus();
      }
    });

    /* Close on resize past breakpoint */
    window.addEventListener('resize', () => {
      if (window.innerWidth >= BREAKPOINT && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  function toggleMobileMenu() {
    const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-open');
    /* Focus trap: focus the first link */
    const firstFocusable = mobileMenu.querySelector('a, button, input');
    if (firstFocusable) firstFocusable.focus();
    /* Set up focus trap */
    mobileMenu.addEventListener('keydown', trapFocus);
  }

  function closeMobileMenu() {
    if (!hamburgerBtn || !mobileMenu) return;
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    mobileMenu.removeEventListener('keydown', trapFocus);
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusableEls = mobileMenu.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  /* ---- Search Functionality (Home page only) ---- */
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const clearBtn = document.getElementById('clear-btn');
  const searchError = document.getElementById('search-error');
  const resultsContainer = document.getElementById('search-results');

  /* Also grab mobile search elements */
  const mobileSearchInput = document.getElementById('mobile-search-input');
  const mobileSearchBtn = document.getElementById('mobile-search-btn');
  const mobileClearBtn = document.getElementById('mobile-clear-btn');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => performSearch(searchInput));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performSearch(searchInput);
    });
    clearBtn.addEventListener('click', () => clearSearch(searchInput));
  }

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', () => {
      performSearch(mobileSearchInput);
      closeMobileMenu();
    });
    mobileSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch(mobileSearchInput);
        closeMobileMenu();
      }
    });
    mobileClearBtn.addEventListener('click', () => {
      clearSearch(mobileSearchInput);
      closeMobileMenu();
    });
  }

  /* ---- Load Data ---- */
  if (resultsContainer) {
    loadData();
  }

  async function loadData() {
    try {
      const response = await fetch('./travel_recommendation_api.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      travelData = await response.json();
    } catch (err) {
      console.error('Failed to load travel data:', err);
      showDataError('Unable to load travel data. Please ensure you are running a local server (not file://).');
    }
  }

  function showDataError(message) {
    const existing = document.querySelector('.data-error');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'data-error';
    el.setAttribute('role', 'alert');
    el.textContent = message;
    document.body.appendChild(el);
  }

  /* ---- Search Logic ---- */
  function performSearch(inputEl) {
    if (!travelData) {
      showValidationError('Data is still loading. Please try again.');
      return;
    }

    const raw = inputEl.value.trim();

    /* Reject under 3 characters */
    if (raw.length < 3) {
      showValidationError('Please enter a valid search query');
      return;
    }

    hideValidationError();
    const query = raw.toLowerCase();
    const results = [];

    /* Step 1: Check if query matches a category keyword (with stem handling) */
    const stemmedQuery = STEM_MAP[query] || query;
    const categoryKey = CATEGORY_KEY_MAP[stemmedQuery];

    if (categoryKey) {
      /* Category keyword matched */
      if (categoryKey === 'countries') {
        /* Return ≥2 cards from DIFFERENT countries */
        const countriesArr = travelData.countries || [];
        const picked = [];
        for (const country of countriesArr) {
          if (country.cities && country.cities.length > 0) {
            const city = country.cities[0];
            picked.push({
              name: city.name,
              imageUrl: city.imageUrl,
              description: city.description,
              type: 'country',
              countryName: country.name
            });
          }
          if (picked.length >= 3) break; /* Show up to 3 from different countries */
        }
        results.push(...picked);
      } else {
        /* beaches, temples, mosques — flat arrays, take first 3 */
        const items = travelData[categoryKey] || [];
        for (let i = 0; i < Math.min(items.length, 3); i++) {
          results.push({
            name: items[i].name,
            imageUrl: items[i].imageUrl,
            description: items[i].description,
            type: stemmedQuery,
            countryName: null
          });
        }
      }
    }

    /* Step 2: If no category match, search by name tokens (word boundary) */
    if (results.length === 0) {
      const queryTokens = query.split(/[\s,]+/).filter(t => t.length > 0);

      /* Search countries → cities */
      if (travelData.countries) {
        for (const country of travelData.countries) {
          /* Check country name */
          const countryTokens = country.name.toLowerCase().split(/[\s,]+/);
          const countryMatches = queryTokens.every(qt =>
            countryTokens.some(ct => ct === qt || STEM_MAP[ct] === qt || ct === STEM_MAP[qt])
          );

          if (countryMatches) {
            /* Country name matched — add cities from this country */
            for (const city of country.cities) {
              results.push({
                name: city.name,
                imageUrl: city.imageUrl,
                description: city.description,
                type: 'country',
                countryName: country.name
              });
            }
          } else {
            /* Check each city name */
            for (const city of country.cities) {
              const cityTokens = city.name.toLowerCase().split(/[\s,]+/);
              const cityMatches = queryTokens.every(qt =>
                cityTokens.some(ct => ct === qt || ct.startsWith(qt) && qt.length >= 3)
              );
              if (cityMatches) {
                results.push({
                  name: city.name,
                  imageUrl: city.imageUrl,
                  description: city.description,
                  type: 'country',
                  countryName: country.name
                });
              }
            }
          }
        }
      }

      /* Search flat arrays: temples, beaches, mosques */
      for (const catKey of ['temples', 'beaches', 'mosques']) {
        const items = travelData[catKey] || [];
        for (const item of items) {
          const itemTokens = item.name.toLowerCase().split(/[\s,]+/);
          const matches = queryTokens.every(qt =>
            itemTokens.some(ct => ct === qt || ct.startsWith(qt) && qt.length >= 3)
          );
          if (matches) {
            results.push({
              name: item.name,
              imageUrl: item.imageUrl,
              description: item.description,
              type: catKey.replace(/s$/, ''),
              countryName: null
            });
          }
        }
      }
    }

    renderResults(results);
  }

  function renderResults(results) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.classList.add('active');
      resultsContainer.innerHTML = `
        <div class="no-results" role="status">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <p>No destinations found for your search. Try keywords like <strong>beach</strong>, <strong>temple</strong>, <strong>country</strong>, or a city name.</p>
        </div>
      `;
      return;
    }

    resultsContainer.classList.add('active');

    /* Group results by country for time banners (only for country type) */
    let lastCountry = null;

    for (const item of results) {
      /* Time banner for country/city results */
      if (item.type === 'country' && item.countryName) {
        const tz = getTimezone(item.name, item.countryName);
        if (tz && item.countryName !== lastCountry) {
          lastCountry = item.countryName;
          const banner = document.createElement('div');
          banner.className = 'search-results__time-banner';
          banner.setAttribute('role', 'status');
          banner.setAttribute('aria-live', 'polite');
          updateTimeBanner(banner, tz);
          resultsContainer.appendChild(banner);
          /* Update every second */
          const interval = setInterval(() => {
            if (!document.body.contains(banner)) {
              clearInterval(interval);
              return;
            }
            updateTimeBanner(banner, tz);
          }, 1000);
        }
      }

      const card = createResultCard(item);
      resultsContainer.appendChild(card);
    }
  }

  function createResultCard(item) {
    const card = document.createElement('article');
    card.className = 'result-card';

    card.innerHTML = `
      <img
        class="result-card__image"
        src="${escapeHtml(item.imageUrl)}"
        alt="${escapeHtml(item.name)}"
        loading="lazy"
        decoding="async"
        width="400"
        height="300"
        onerror="this.onerror=null; this.src='./images/placeholder.jpg';"
      >
      <div class="result-card__body">
        <h3 class="result-card__name">${escapeHtml(item.name)}</h3>
        <p class="result-card__desc">${escapeHtml(item.description)}</p>
        <a class="result-card__visit"
           href="${escapeHtml(item.imageUrl)}"
           target="_blank"
           rel="noopener noreferrer">
          Visit
        </a>
      </div>
    `;

    return card;
  }

  function getTimezone(cityName, countryName) {
    /* Try city-specific first */
    const cityPart = cityName.split(',')[0].trim().toLowerCase();
    if (CITY_TIMEZONE_MAP[cityPart]) return CITY_TIMEZONE_MAP[cityPart];

    /* Fall back to country */
    const countryLower = countryName.toLowerCase();
    if (TIMEZONE_MAP[countryLower]) return TIMEZONE_MAP[countryLower];

    return null;
  }

  function updateTimeBanner(el, tz) {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        hour12: true
      });
      el.textContent = `Current Local Time (${tz}): ${timeStr}`;
    } catch (e) {
      el.textContent = '';
    }
  }

  function showValidationError(msg) {
    if (searchError) {
      searchError.textContent = msg;
      searchError.classList.add('visible');
      setTimeout(() => hideValidationError(), 3000);
    }
  }

  function hideValidationError() {
    if (searchError) {
      searchError.classList.remove('visible');
    }
  }

  function clearSearch(inputEl) {
    if (inputEl) inputEl.value = '';
    /* Also clear the other input (desktop/mobile sync) */
    if (searchInput) searchInput.value = '';
    if (mobileSearchInput) mobileSearchInput.value = '';
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('active');
    }
    hideValidationError();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---- Contact Form Validation ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    let isValid = true;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const msgInput = document.getElementById('contact-message');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const msgError = document.getElementById('message-error');
    const successMsg = document.getElementById('contact-success');

    /* Reset errors */
    clearFieldError(nameInput, nameError);
    clearFieldError(emailInput, emailError);
    clearFieldError(msgInput, msgError);
    if (successMsg) successMsg.classList.remove('visible');

    /* Validate name */
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, nameError, 'Please enter your name');
      isValid = false;
    }

    /* Validate email */
    if (!emailInput.value.trim()) {
      setFieldError(emailInput, emailError, 'Please enter your email');
      isValid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address');
      isValid = false;
    }

    /* Validate message */
    if (!msgInput.value.trim()) {
      setFieldError(msgInput, msgError, 'Please enter your message');
      isValid = false;
    }

    if (isValid) {
      /* Show success */
      if (successMsg) successMsg.classList.add('visible');
      contactForm.reset();
      /* Hide success after 5 seconds */
      setTimeout(() => {
        if (successMsg) successMsg.classList.remove('visible');
      }, 5000);
    }
  }

  function setFieldError(input, errorEl, message) {
    input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(input, errorEl) {
    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
