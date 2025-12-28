const countrySelect = document.getElementById("countrySelect");
const citySelect = document.getElementById("citySelect");

async function loadCountries() {
    if (!countrySelect) return;
    try {
        const res = await fetch("data/countries.json");
        const raw = await res.json();

        countrySelect.innerHTML = `<option value="">Select Country</option>`;

        // support array of strings or array of {id,name}
        const countries = Array.isArray(raw) ? raw : [];

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
            countrySelect.appendChild(option);
        });

        // restore selection if saved
        if (typeof loadSelection === 'function') {
            const saved = loadSelection();
            if (saved && saved.country) {
                countrySelect.value = saved.country;
                await loadCities(saved.country);
                if (saved.city && citySelect) {
                    citySelect.value = saved.city;
                    citySelect.dispatchEvent(new Event('change'));
                }
            }
        }

    } catch (e) {
        console.error('Failed to load countries', e);
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
