const countrySelect = document.getElementById("countrySelect");
const citySelect = document.getElementById("citySelect");

async function loadCountries() {
    if (!countrySelect) return;
    try {
        console.log('loadCountries: fetching data/countries.json');
        const res = await fetch("data/countries.json");
        console.log('loadCountries: fetch response', res && res.status);
        const raw = await res.json();

        countrySelect.innerHTML = `<option value="">Select Country</option>`;

        // support array of strings or array of {id,name}
        const countries = Array.isArray(raw) ? raw : [];

        // Sort countries alphabetically by name (A-Z)
        countries.sort((a, b) => {
            let nameA = typeof a === 'string' 
                ? a.split('-').map(w=>w[0]?.toUpperCase()+w.slice(1)).join(' ')
                : (a && a.name ? a.name : a.id);
            let nameB = typeof b === 'string'
                ? b.split('-').map(w=>w[0]?.toUpperCase()+w.slice(1)).join(' ')
                : (b && b.name ? b.name : b.id);
            return nameA.localeCompare(nameB);
        });

        console.log('loadCountries: parsed countries count', countries.length);
        countries.forEach(item => {
            let id, name;
            if (typeof item === 'string') {
                id = item;
                name = item.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
            } else if (item && item.id) {
                id = item.id; name = item.name || item.id;
            } else return;

            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            // attach timezone if available (used for API timezonestring)
            if (item && item.timezone) option.dataset.timezone = item.timezone;
            countrySelect.appendChild(option);
        });

        // restore selection if saved (also restore method and custom address UI if present)
        if (typeof loadSelection === 'function') {
            const saved = loadSelection();
            if (saved) {
                if (saved.country) {
                    countrySelect.value = saved.country;
                    await loadCities(saved.country);
                }

                // restore method, advanced settings and custom address inputs if available
                try {
                    const methodEl = document.getElementById('methodSelect');
                    if (methodEl && saved.method) methodEl.value = saved.method;

                    const tuneEl = document.getElementById('tuneInput');
                    const tzEl = document.getElementById('timezoneInput');
                    const calMethodEl = document.getElementById('calendarMethodSelect');
                    const hijriY = document.getElementById('hijriYearInput');
                    const hijriM = document.getElementById('hijriMonthInput');
                    const shafaqEl = document.getElementById('shafaqSelect');
                    if (tuneEl && saved.tune) tuneEl.value = saved.tune;
                    if (tzEl && saved.timezone) tzEl.value = saved.timezone;
                    if (calMethodEl && saved.calendarMethod) calMethodEl.value = saved.calendarMethod;
                    if (hijriY && saved.hijriYear) hijriY.value = saved.hijriYear;
                    if (hijriM && saved.hijriMonth) hijriM.value = saved.hijriMonth;
                    if (shafaqEl && saved.shafaq) shafaqEl.value = saved.shafaq;

                    const useCustomEl = document.getElementById('useCustomAddress');
                    const customEl = document.getElementById('customAddressInput');
                    if (useCustomEl) useCustomEl.checked = !!saved.useCustom;
                    if (customEl && saved.customAddress) customEl.value = saved.customAddress;

                    // advanced toggle
                    const adv = document.getElementById('advancedToggle');
                    if (adv) adv.checked = !!saved.advanced;
                    // show/hide advancedOptions if present
                    const advBox = document.getElementById('advancedOptions');
                    if (advBox) advBox.style.display = (adv && adv.checked) ? 'flex' : 'none';
                } catch (e) {
                    // ignore
                }

                if (saved.city && citySelect) {
                    citySelect.value = saved.city;
                    citySelect.dispatchEvent(new Event('change'));
                }

                // restore asr method if present
                try{
                    const asrEl = document.getElementById('asrMethod');
                    if (asrEl && saved.asrMethod) { asrEl.value = saved.asrMethod; }
                }catch(e){}

            }
        }

        // If the user has no saved selection, default to Pakistan / Karachi
        try {
            const current = (typeof loadSelection === 'function') ? loadSelection() : null;
            if (!current || !current.country) {
                const defaultCountry = 'pakistan';
                const defaultCity = 'Karachi';
                // set default country if available
                const hasCountry = Array.from(countrySelect.options).some(o => o && o.value === defaultCountry);
                if (hasCountry) {
                    countrySelect.value = defaultCountry;
                    await loadCities(defaultCountry);
                    // set default city if available
                    const hasCity = Array.from(citySelect.options).some(o => o && o.value === defaultCity);
                    if (hasCity) {
                        citySelect.value = defaultCity;
                        citySelect.dispatchEvent(new Event('change'));
                        // persist this default as the initial selection
                        if (typeof saveSelection === 'function') saveSelection(defaultCountry, defaultCity);

                        // If defaulting to Pakistan, set Asr method to Hanafi (common in region)
                        try{
                            const asrEl = document.getElementById('asrMethod');
                            if (asrEl && (!loadSelection || !loadSelection().asrMethod)) {
                                asrEl.value = 'hanafi';
                                // persist choice
                                if (typeof saveSelection === 'function') saveSelection(defaultCountry, defaultCity);
                            }
                        }catch(e){}
                    }
                }
            }
        } catch (e) {
            // ignore errors from defaulting
        }

    } catch (e) {
        console.error('Failed to load countries', e);
        if (countrySelect) countrySelect.innerHTML = `<option value="">Failed to load countries</option>`;
    }
}

async function loadCities(countryId) {
    if (!citySelect) return;
    try {
        citySelect.innerHTML = `<option value="">Select City</option>`;
        const res = await fetch(`data/${countryId}/cities.json`);
        const data = await res.json();

        // support array or { cities: [...] }
        const list = Array.isArray(data) ? data : (data && data.cities ? data.cities : []);

        // Sort cities alphabetically by name (A-Z)
        list.sort((a, b) => {
            let labelA = typeof a === 'string'
                ? a.split(/[-_\s]/).map(w=>w[0]?w[0].toUpperCase()+w.slice(1):w).join(' ')
                : (a && a.name ? a.name : a.id);
            let labelB = typeof b === 'string'
                ? b.split(/[-_\s]/).map(w=>w[0]?w[0].toUpperCase()+w.slice(1):w).join(' ')
                : (b && b.name ? b.name : b.id);
            return labelA.localeCompare(labelB);
        });

        list.forEach(item => {
            let value, label;
            if (typeof item === 'string') { value = item; label = capitalizeDisplay(item); }
            else if (item && item.id) { value = item.id; label = item.name || item.id; }
            else return;

            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            citySelect.appendChild(option);
        });
    } catch (e) {
        console.error('Failed to load cities for', countryId, e);
    }
}

function capitalizeDisplay(s){
    return s.split(/[-_\s]/).map(w=>w[0]?w[0].toUpperCase()+w.slice(1):w).join(' ')
}

if (countrySelect) {
    countrySelect.addEventListener('change', () => {
        const c = countrySelect.value;
        if (typeof saveSelection === 'function') saveSelection(c, '');
        if (c) loadCities(c);
    });
}

if (citySelect) {
    citySelect.addEventListener('change', () => {
        if (typeof saveSelection === 'function') saveSelection(countrySelect.value, citySelect.value);
    });
}

// expose for other scripts
window.loadCountries = loadCountries;
window.loadCities = loadCities;
