const tableBody = document.querySelector("#timingsTable tbody");

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

async function renderTimings(country, city) {
    tableBody.innerHTML = "";

    const res = await fetch(`data/${country}/${city}.json`);
    const data = await res.json();

    const today = new Date().toISOString().split("T")[0];

    // Check 24-hour format preference
    const use24HourCheckbox = document.getElementById('use24HourFormat');
    const use24Hour = use24HourCheckbox ? use24HourCheckbox.checked : false;

    data.ramzan.forEach(day => {
        const row = document.createElement("tr");

        if (day.date === today) {
            row.classList.add("today");
        }

        row.innerHTML = `
            <td>${day.day}</td>
            <td>${day.date}</td>
            <td>${formatTime(day.sehri, use24Hour)}</td>
            <td>${formatTime(day.iftar, use24Hour)}</td>
        `;

        tableBody.appendChild(row);
    });
}

citySelect.addEventListener("change", () => {
    const country = countrySelect.value;
    const city = citySelect.value;

    if (!country || !city) return;

    saveSelection(country, city);
    renderTimings(country, city);
});

// 24-hour format checkbox
const use24HourCheckbox = document.getElementById('use24HourFormat');
if (use24HourCheckbox) {
    // Load saved preference
    const saved24Hour = localStorage.getItem('ramzanUse24Hour') === '1';
    use24HourCheckbox.checked = saved24Hour;

    // Add event listener
    use24HourCheckbox.addEventListener('change', function() {
        localStorage.setItem('ramzanUse24Hour', this.checked ? '1' : '0');
        // Refresh table display
        const country = countrySelect.value;
        const city = citySelect.value;
        if (country && city) {
            renderTimings(country, city);
        }
    });
}

loadCountries();
