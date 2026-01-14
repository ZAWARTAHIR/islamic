const calendarContainer = document.getElementById("calendarContainer");

const methodSelect = document.getElementById('methodSelect');
const shafaqSelect = document.getElementById('shafaqSelect');
const hijriYearInput = document.getElementById('hijriYearInput');
const hijriMonthInput = document.getElementById('hijriMonthInput');
const tuneInput = document.getElementById('tuneInput');
const timezoneInput = document.getElementById('timezoneInput');
const calendarMethodSelect = document.getElementById('calendarMethodSelect');
const useCustomAddressCheckbox = document.getElementById('useCustomAddress');
const customAddressInput = document.getElementById('customAddressInput');
const advancedToggle = document.getElementById('advancedToggle');
const advancedOptions = document.getElementById('advancedOptions');

let lastParams = null;
let lastData = null;

function buildLabels() {
    const countryLabel = countrySelect && countrySelect.selectedIndex >= 0 ? countrySelect.options[countrySelect.selectedIndex].textContent : '';
    const cityLabel = citySelect && citySelect.selectedIndex >= 0 ? citySelect.options[citySelect.selectedIndex].textContent : '';
    return { countryLabel, cityLabel };
}

async function refreshCalendar() {
    const country = countrySelect.value;
    const city = citySelect.value;
    if (!country || !city) return;

    const { countryLabel, cityLabel } = buildLabels();
    const params = {
        hijriYear: hijriYearInput ? hijriYearInput.value : '',
        hijriMonth: hijriMonthInput ? hijriMonthInput.value : '',
        countryLabel,
        cityLabel,
        method: methodSelect ? methodSelect.value : '3',
        shafaq: shafaqSelect ? shafaqSelect.value : 'general',
        tune: tuneInput ? tuneInput.value : '',
        timezonestring: timezoneInput ? timezoneInput.value : 'UTC',
        calendarMethod: calendarMethodSelect ? calendarMethodSelect.value : 'UAQ',
        address: (useCustomAddressCheckbox && useCustomAddressCheckbox.checked && customAddressInput && customAddressInput.value) ? customAddressInput.value.trim() : ''
    };

    // Avoid duplicate fetches
    const same = lastParams && JSON.stringify(lastParams) === JSON.stringify(params);
    if (same && lastData) {
        renderData(lastData);
        return;
    }

    calendarContainer.innerHTML = '<div class="loading">Loading calendar…</div>';
    try {
        const data = await buildAndFetchHijriCalendar(params);
        lastParams = params;
        lastData = data;
        renderData(data);
    } catch (err) {
        calendarContainer.innerHTML = `<div class="error">Failed to load calendar: ${err.message}</div>`;
        console.error(err);
    }
}

function renderData(data) {
    if (!Array.isArray(data)) {
        calendarContainer.innerHTML = '<div class="error">No data available</div>';
        return;
    }

    // Desktop: table, Mobile: cards
    if (window.innerWidth >= 900) {
        const table = document.createElement('table');
        table.className = 'timings-table';
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Day</th><th>Hijri Date</th><th>Gregorian Date</th><th>Sehri End</th><th>Iftar</th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        data.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${d.day}</td><td>${d.hijriDate}</td><td>${d.gregorianDate}</td><td>${d.sehri}</td><td>${d.iftar}</td>`;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        calendarContainer.innerHTML = '';
        calendarContainer.appendChild(table);
    } else {
        calendarContainer.innerHTML = '';
        data.forEach(d => {
            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <h3>Ramzan ${d.day}</h3>
                <p><strong>Hijri:</strong> ${d.hijriDate}</p>
                <p><strong>Gregorian:</strong> ${d.gregorianDate}</p>
                <p><strong>Sehri End:</strong> ${d.sehri}</p>
                <p><strong>Iftar:</strong> ${d.iftar}</p>
            `;
            calendarContainer.appendChild(card);
        });
    }
}

// watchers
if (countrySelect) countrySelect.addEventListener('change', () => {
    if (typeof saveSelection === 'function') saveSelection(countrySelect.value, citySelect.value);
    refreshCalendar();
});

if (citySelect) citySelect.addEventListener('change', () => {
    if (typeof saveSelection === 'function') saveSelection(countrySelect.value, citySelect.value);
    refreshCalendar();
});

if (methodSelect) methodSelect.addEventListener('change', () => { if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : ''); refreshCalendar(); });
if (shafaqSelect) shafaqSelect.addEventListener('change', () => { if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : ''); refreshCalendar(); });
if (hijriYearInput) hijriYearInput.addEventListener('change', () => { if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : ''); refreshCalendar(); });
if (hijriMonthInput) hijriMonthInput.addEventListener('change', () => { if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : ''); refreshCalendar(); });
if (tuneInput) tuneInput.addEventListener('change', () => { if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : ''); refreshCalendar(); });
if (timezoneInput) timezoneInput.addEventListener('change', () => { if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : ''); refreshCalendar(); });
if (calendarMethodSelect) calendarMethodSelect.addEventListener('change', () => { if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : ''); refreshCalendar(); });

if (advancedToggle) advancedToggle.addEventListener('change', () => {
    try { if (advancedOptions) advancedOptions.style.display = advancedToggle.checked ? 'flex' : 'none'; } catch(e){}
    if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : '');
});

window.addEventListener('resize', () => {
    if (lastData) renderData(lastData);
});

// initialize
loadCountries();

function updateCustomAddressUI_calendar() {
    try {
        const use = useCustomAddressCheckbox && useCustomAddressCheckbox.checked;
        if (customAddressInput && customAddressInput.parentElement) customAddressInput.parentElement.style.display = use ? 'block' : 'none';
        if (countrySelect) countrySelect.disabled = !!use;
        if (citySelect) citySelect.disabled = !!use;
        if (typeof saveSelection === 'function') saveSelection(countrySelect ? countrySelect.value : '', citySelect ? citySelect.value : '');
    } catch (e) {}
}

if (useCustomAddressCheckbox) useCustomAddressCheckbox.addEventListener('change', updateCustomAddressUI_calendar);
try { updateCustomAddressUI_calendar(); } catch(e) {}
