const sehriEl = document.getElementById("sehriTime");
const iftarEl = document.getElementById("iftarTime");

// main.js — Global logic for home and pages
console.log('ramzan calendar: main loaded');

const sehriEl = document.getElementById('sehriTime');
const iftarEl = document.getElementById('iftarTime');
const countdownEl = document.getElementById('countdown');
const countrySelect = document.getElementById('countrySelect');
const citySelect = document.getElementById('citySelect');

async function updateTodayTimings(country, city) {
    if (!country || !city) return;
    try {
        let res = await fetch(`data/${country}/${city}.json`);
        let data = await res.json();

        // If city file doesn't contain ramzan schedule, fall back to sample
        if (!data.ramzan) {
            const s = await fetch('data/sample-ramzan.json');
            data = await s.json();
        }

        const today = new Date().toISOString().split('T')[0];
        const todayData = data.ramzan.find(d => d.date === today) || data.ramzan[0];

        if (sehriEl && todayData) sehriEl.textContent = todayData.sehri || '--';
        if (iftarEl && todayData) iftarEl.textContent = todayData.iftar || '--';

        if (typeof startCountdown === 'function') startCountdownFromData(todayData);
    } catch (e) {
        console.error('Failed to load timings', e);
    }
}

function startCountdownFromData(dayData) {
    if (!dayData || !dayData.iftar) return;
    if (!countdownEl) return;
    const [h, m] = dayData.iftar.split(':').map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    // if target already passed, show message
    if (target - now <= 0) {
        countdownEl.textContent = 'Iftar time may have passed';
        return;
    }
    if (typeof startCountdown === 'function') startCountdown({target});
}

// initialize on pages that have selectors
if (typeof loadCountries === 'function') loadCountries();

if (citySelect) {
    citySelect.addEventListener('change', async () => {
        const country = countrySelect.value;
        const city = citySelect.value;
        if (!country || !city) return;
        if (typeof saveSelection === 'function') saveSelection(country, city);
        await updateTodayTimings(country, city);
        // if timings table exists, populate it
        populateTimingsTable(country, city);
    });
}

async function populateTimingsTable(country, city) {
    try {
        const table = document.getElementById('timingsTable');
        if (!table) return;
        let res = await fetch(`data/${country}/${city}.json`);
        let data = await res.json();
        if (!data.ramzan) {
            const s = await fetch('data/sample-ramzan.json');
            data = await s.json();
        }
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        data.ramzan.forEach(d => {
            const tr = document.createElement('tr');
            const day = document.createElement('td'); day.textContent = d.day || '-';
            const date = document.createElement('td'); date.textContent = d.date || '-';
            const sehri = document.createElement('td'); sehri.textContent = d.sehri || '-';
            const iftar = document.createElement('td'); iftar.textContent = d.iftar || '-';
            tr.appendChild(day); tr.appendChild(date); tr.appendChild(sehri); tr.appendChild(iftar);
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error('Failed to populate timings table', e);
    }
}

// On page load, if a saved selection exists, trigger update
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof loadSelection === 'function' && countrySelect && citySelect) {
        const saved = loadSelection();
        if (saved && saved.country) {
            countrySelect.value = saved.country;
            if (typeof loadCities === 'function') await loadCities(saved.country);
            if (saved.city) {
                citySelect.value = saved.city;
                citySelect.dispatchEvent(new Event('change'));
            }
        }
    }
});
    const country = countrySelect.value;
    const city = citySelect.value;

    if (!country || !city) return;

    const res = await fetch(`data/${country}/${city}.json`);
    const data = await res.json();

    // For demo: Day 1
    sehriEl.textContent = data.ramzan[0].sehri;
    iftarEl.textContent = data.ramzan[0].iftar;
});

loadCountries();
citySelect.addEventListener("change", () => {
    startCountdown(countrySelect.value, citySelect.value);
});
