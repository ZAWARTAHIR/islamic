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

// Global variable for download functionality
window.lastCalendarData = null;

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

function buildLabels() {
    const countryLabel = countrySelect && countrySelect.selectedIndex >= 0 ? countrySelect.options[countrySelect.selectedIndex].textContent : '';
    const cityLabel = citySelect && citySelect.selectedIndex >= 0 ? citySelect.options[citySelect.selectedIndex].textContent : '';
    return { countryLabel, cityLabel };
}

async function refreshCalendar() {
    const country = countrySelect.value;
    const city = citySelect.value;
    if (!country || !city) {
        // Show message when no city is selected
        calendarContainer.innerHTML = '<div class="no-selection">Please select a country and city above to view the Ramzan calendar.</div>';
        return;
    }

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

    // Store data globally for download functionality
    window.lastCalendarData = data;

    // Check 24-hour format preference
    const use24HourCheckbox = document.getElementById('use24HourFormat');
    const use24Hour = use24HourCheckbox ? use24HourCheckbox.checked : false;

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
            tr.innerHTML = `<td>${d.day}</td><td>${d.hijriDate}</td><td>${d.gregorianDate}</td><td>${formatTime(d.sehri, use24Hour)}</td><td>${formatTime(d.iftar, use24Hour)}</td>`;
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
                <p><strong>Sehri End:</strong> ${formatTime(d.sehri, use24Hour)}</p>
                <p><strong>Iftar:</strong> ${formatTime(d.iftar, use24Hour)}</p>
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
refreshCalendar(); // Show initial message

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

// 24-hour format checkbox
const use24HourCheckbox = document.getElementById('use24HourFormat');
if (use24HourCheckbox) {
    // Load saved preference
    const saved24Hour = localStorage.getItem('ramzanUse24Hour') === '1';
    use24HourCheckbox.checked = saved24Hour;

    // Add event listener
    use24HourCheckbox.addEventListener('change', function() {
        localStorage.setItem('ramzanUse24Hour', this.checked ? '1' : '0');
        // Refresh calendar display
        if (lastData) renderData(lastData);
    });
}
