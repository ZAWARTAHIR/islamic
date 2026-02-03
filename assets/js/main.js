/* main.js — Homepage initialization (refactored)
   - Self-contained IIFE to prevent global duplicate declarations
   - Initializes on DOMContentLoaded
   - Loads countries via existing `loadCountries()` and restores selection
   - Updates today's Sehri/Iftar using API helper `fetchTodayTimingsByAddress` if available
*/
(function(){
  'use strict';

  // Time formatting function
  function formatTime(timeString, use24Hour = false) {
    if (!timeString || timeString === '--') return timeString;

    // Remove any parentheses and extra text
    const cleanTime = timeString.replace(/\s*\(.*$/,'').trim();

    // Check if it's already in HH:MM format
    const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) return cleanTime;

    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];

    if (use24Hour) {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes} ${period}`;
    }
  }

  async function updateTodayTimings(addressToUse, els, opts={}){
    const {sehriEl, iftarEl, countdownEl} = els;
    if (!addressToUse) return;

    // show loading indicators where appropriate
    if (sehriEl) sehriEl.textContent = 'Loading…';
    if (iftarEl) iftarEl.textContent = 'Loading…';
    const sehri12El = document.getElementById('sehriTime12');
    const sehri24El = document.getElementById('sehriTime24');
    const iftar12El = document.getElementById('iftarTime12');
    const iftar24El = document.getElementById('iftarTime24');

    try {
      if (typeof fetchTodayTimingsByAddress === 'function'){
        const resp = await fetchTodayTimingsByAddress(opts);
        const t = resp && resp.timings ? resp.timings : {};
        const dateStr = resp && resp.date && resp.date.gregorian ? resp.date.gregorian.date : '';
        const sehriRaw = (t.Imsak || t.Fajr || '--').replace(/\s*\(.*$/,'').trim();
        const iftarRaw = (t.Maghrib || t.Sunset || '--').replace(/\s*\(.*$/,'').trim();

        // Populate date (if available) and both 12/24-hour columns
        const homeDateEl = document.getElementById('homePrayerDate');
        if (homeDateEl) homeDateEl.textContent = dateStr || '';

        if (sehri12El) sehri12El.textContent = formatTime(sehriRaw, false);
        if (sehri24El) sehri24El.textContent = formatTime(sehriRaw, true);
        if (iftar12El) iftar12El.textContent = formatTime(iftarRaw, false);
        if (iftar24El) iftar24El.textContent = formatTime(iftarRaw, true);

        // Keep backward compat with single elements if present
        const use24HourCheckbox = document.getElementById('use24HourFormat');
        const use24Hour = use24HourCheckbox ? use24HourCheckbox.checked : false;
        if (sehriEl) sehriEl.textContent = formatTime(sehriRaw, use24Hour);
        if (iftarEl) iftarEl.textContent = formatTime(iftarRaw, use24Hour);

        // Choose the next upcoming event (prefer Sehri if it's upcoming) and start countdown
        if (typeof startCountdown === 'function'){
          const parseTimeToToday = function(timeStr, addDays=0){
            if(!timeStr || timeStr === '--') return null;
            const m = (''+timeStr).match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
            if(!m) return null;
            let hh = parseInt(m[1],10), mm = parseInt(m[2],10);
            const ampm = (m[3]||'').toUpperCase();
            if (ampm === 'PM' && hh < 12) hh += 12;
            if (ampm === 'AM' && hh === 12) hh = 0;
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate()+addDays, hh, mm, 0);
          };

          const now = new Date();
          let sehriTarget = parseTimeToToday(sehriRaw);
          let iftarTarget = parseTimeToToday(iftarRaw);

          let selected = null; let label = '';
          if (sehriTarget && now < sehriTarget) { selected = sehriTarget; label = 'Sehri'; }
          else if (iftarTarget && now < iftarTarget) { selected = iftarTarget; label = 'Iftar'; }
          else if (sehriTarget) { sehriTarget = parseTimeToToday(sehriRaw, 1); selected = sehriTarget; label = 'Sehri'; }
          else if (iftarTarget) { iftarTarget = parseTimeToToday(iftarRaw, 1); selected = iftarTarget; label = 'Iftar'; }

          if (selected) {
            startCountdown({
              target: selected,
              label: label,
              onFinish: function(){
                // refresh timings after the event so countdown can switch to the next event
                setTimeout(()=> updateTodayTimings(addressToUse, {sehriEl, iftarEl, countdownEl}, opts), 1500);
              }
            });
          }
        }
        return;
      }

      // fallback: do nothing (other code may handle local data)
      if (sehriEl) sehriEl.textContent = '--';
      if (iftarEl) iftarEl.textContent = '--';
      if (sehri12El) sehri12El.textContent = '--';
      if (sehri24El) sehri24El.textContent = '--';
      if (iftar12El) iftar12El.textContent = '--';
      if (iftar24El) iftar24El.textContent = '--';
    } catch (err){
      console.error('updateTodayTimings error', err);
      if (sehriEl) sehriEl.textContent = '--';
      if (iftarEl) iftarEl.textContent = '--';
      if (sehri12El) sehri12El.textContent = '--';
      if (sehri24El) sehri24El.textContent = '--';
      if (iftar12El) iftar12El.textContent = '--';
      if (iftar24El) iftar24El.textContent = '--';
    }
  }

  document.addEventListener('DOMContentLoaded', async function(){
    const sehriEl = document.getElementById('sehriTime');
    const iftarEl = document.getElementById('iftarTime');
    const countdownEl = document.getElementById('countdown');
    const countrySelect = document.getElementById('countrySelect');
    const citySelect = document.getElementById('citySelect');
    const methodSelect = document.getElementById('methodSelect');
    const tuneInput = document.getElementById('tuneInput');
    const timezoneInput = document.getElementById('timezoneInput');
    const useCustomEl = document.getElementById('useCustomAddress');
    const customAddressEl = document.getElementById('customAddressInput');
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedOptions = document.getElementById('advancedOptions');

    // small-screen hamburger toggle (if navbar markup exists)
    const navToggle = document.getElementById('navToggle');
    const navEl = document.querySelector('.navbar');
    const navLeft = document.getElementById('navLeft');
    if (navToggle && navEl) {
      // avoid adding multiple click handlers (fallback may also bind)
      if (!navToggle.__navBound) {
        navToggle.addEventListener('click', function(e){
          const isOpen = navEl.classList.toggle('open');
          navToggle.setAttribute('aria-expanded', String(!!isOpen));
          // prevent background scrolling when nav is open
          document.documentElement.classList.toggle('nav-open', !!isOpen);
          document.body.classList.toggle('nav-open', !!isOpen);
        });
        navToggle.__navBound = true;
      }
      if (navLeft) navLeft.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{ navEl.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); document.documentElement.classList.remove('nav-open'); document.body.classList.remove('nav-open'); }));
      document.addEventListener('click', (e)=>{ if (!navEl.contains(e.target) && navEl.classList.contains('open')) { navEl.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); document.documentElement.classList.remove('nav-open'); document.body.classList.remove('nav-open'); }});
    }

    // load countries (provided by country-city.js)
    try {
      if (typeof loadCountries === 'function') await loadCountries();
    } catch (e){ console.warn('loadCountries failed', e); }

    // helper to resolve timezone: prefer explicit input, otherwise country option dataset, otherwise UTC
    function getTimezoneForCountry(){
      if (timezoneInput && timezoneInput.value) return timezoneInput.value;
      if (countrySelect && countrySelect.selectedIndex >= 0){
        const opt = countrySelect.options[countrySelect.selectedIndex];
        if (opt && opt.dataset && opt.dataset.timezone) return opt.dataset.timezone;
      }
      return 'UTC';
    }

    // restore saved selection (storage.js)
    try {
      if (typeof loadSelection === 'function'){
        const saved = loadSelection();
        if (saved){
          if (saved.method && methodSelect) methodSelect.value = saved.method;
          if (saved.tune && tuneInput) tuneInput.value = saved.tune;
          if (saved.timezone && timezoneInput) timezoneInput.value = saved.timezone;
          if (saved.useCustom && useCustomEl) useCustomEl.checked = !!saved.useCustom;
          if (saved.customAddress && customAddressEl) customAddressEl.value = saved.customAddress;
          if (saved.country && countrySelect){ countrySelect.value = saved.country; if (typeof loadCities === 'function') await loadCities(saved.country); }
          if (saved.city && citySelect) citySelect.value = saved.city;
        }
      }
    } catch (e){ console.warn('restore selection failed', e); }

    // If no previously saved country/city, attempt IP-based detection (approximate)
    try {
      const savedForGeo = (typeof loadSelection === 'function') ? loadSelection() : null;
      if ((!savedForGeo || (!savedForGeo.country && !savedForGeo.city)) && typeof detectAndSelectCityByIP === 'function') {
        detectAndSelectCityByIP();
      }
    } catch(e){ /* ignore geo detection errors */ }

    // wire change events (keep minimal and safe)
    if (citySelect) citySelect.addEventListener('change', async function(){
      const country = countrySelect ? countrySelect.value : '';
      const city = citySelect.value;
      if (!country || !city) return;
      if (typeof saveSelection === 'function') saveSelection(country, city);
      const addressLabel = citySelect.options[citySelect.selectedIndex] && citySelect.options[citySelect.selectedIndex].textContent || city;
      const countryLabel = countrySelect.options[countrySelect.selectedIndex] && countrySelect.options[countrySelect.selectedIndex].textContent || country;
      const address = `${addressLabel}, ${countryLabel}`;
      const asrEl = document.getElementById('asrMethod');
      const opts = { address, method: methodSelect ? methodSelect.value : '3', timezonestring: getTimezoneForCountry(), tune: tuneInput ? tuneInput.value : '', school: (asrEl && asrEl.value === 'hanafi') ? 1 : 0 };
      console.log('update timings with timezone', opts.timezonestring);
      await updateTodayTimings(address, {sehriEl, iftarEl, countdownEl}, opts);
    });

    if (methodSelect) methodSelect.addEventListener('change', async function(){
      if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : '');
      if (countrySelect && citySelect && citySelect.value) {
        const address = `${citySelect.options[citySelect.selectedIndex].textContent}, ${countrySelect.options[countrySelect.selectedIndex].textContent}`;
        const asrEl = document.getElementById('asrMethod');
        const opts = { address, method: methodSelect ? methodSelect.value : '3', timezonestring: getTimezoneForCountry(), tune: tuneInput ? tuneInput.value : '', school: (asrEl && asrEl.value === 'hanafi') ? 1 : 0 };
        console.log('update timings (method change) timezone', opts.timezonestring);
        await updateTodayTimings(address, {sehriEl, iftarEl, countdownEl}, opts);
      }
    });

    // asr method selector change -> reload timings
    const asrMethodEl = document.getElementById('asrMethod');
    if (asrMethodEl) {
      asrMethodEl.addEventListener('change', async function(){
        if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : '');
        if (countrySelect && citySelect && citySelect.value) {
          const address = `${citySelect.options[citySelect.selectedIndex].textContent}, ${countrySelect.options[countrySelect.selectedIndex].textContent}`;
          const opts = { address, method: methodSelect ? methodSelect.value : '3', timezonestring: getTimezoneForCountry(), tune: tuneInput ? tuneInput.value : '', school: (this.value === 'hanafi') ? 1 : 0 };
          await updateTodayTimings(address, {sehriEl, iftarEl, countdownEl}, opts);
        }
      });
    }

    // 24-hour format checkbox
    const use24HourCheckbox = document.getElementById('use24HourFormat');
    if (use24HourCheckbox) {
      // Load saved preference
      const saved24Hour = localStorage.getItem('ramzanUse24Hour') === '1';
      use24HourCheckbox.checked = saved24Hour;

      // Add event listener
      use24HourCheckbox.addEventListener('change', function() {
        localStorage.setItem('ramzanUse24Hour', this.checked ? '1' : '0');
        // Refresh timings display
        if (countrySelect && citySelect && citySelect.value) {
          const address = `${citySelect.options[citySelect.selectedIndex].textContent}, ${countrySelect.options[countrySelect.selectedIndex].textContent}`;
      const opts = { address, method: methodSelect ? methodSelect.value : '3', timezonestring: getTimezoneForCountry(), tune: tuneInput ? tuneInput.value : '' };
      console.log('update timings with timezone', opts.timezonestring);
          updateTodayTimings(address, {sehriEl, iftarEl, countdownEl}, opts);
        }
      });
    }

    // initial timings load if selection present
    try {
      const saved = (typeof loadSelection === 'function') ? loadSelection() : null;
      let addressToUse = '';
      if (saved && saved.useCustom && saved.customAddress) addressToUse = saved.customAddress;
      else if (countrySelect && citySelect && countrySelect.value && citySelect.value) addressToUse = `${citySelect.options[citySelect.selectedIndex].textContent}, ${countrySelect.options[countrySelect.selectedIndex].textContent}`;
      if (addressToUse) {
        const asrEl = document.getElementById('asrMethod');
        const opts = { address: addressToUse, method: methodSelect ? methodSelect.value : '3', timezonestring: getTimezoneForCountry(), tune: tuneInput ? tuneInput.value : '', school: (asrEl && asrEl.value === 'hanafi') ? 1 : 0 };
        console.log('initial update timings timezone', opts.timezonestring);
        await updateTodayTimings(addressToUse, {sehriEl, iftarEl, countdownEl}, opts);
      }
    } catch (e){ /* ignore */ }

  }); // DOMContentLoaded

})();

// Fallback: attach a lightweight navToggle handler immediately if element exists
(function(){
  try {
    const t = document.getElementById('navToggle');
    const nav = document.querySelector('.navbar');
    if (!t || !nav) return;
    // don't double-bind
    if (t.__navBound) return; t.__navBound = true;
    t.addEventListener('click', function(){
      const open = nav.classList.toggle('open');
      t.setAttribute('aria-expanded', String(!!open));
      document.documentElement.classList.toggle('nav-open', !!open);
      document.body.classList.toggle('nav-open', !!open);
    });
  } catch(e){ /* ignore */ }
})();
