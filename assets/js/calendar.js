const calendarContainer = document.getElementById("calendarContainer");

async function renderCalendar(country, city) {
    calendarContainer.innerHTML = "";

    const res = await fetch(`data/${country}/${city}.json`);
    const data = await res.json();

    data.ramzan.forEach(day => {
        const card = document.createElement("div");
        card.className = "day-card";

        card.innerHTML = `
            <h3>Ramzan ${day.day}</h3>
            <p>Date: ${day.date}</p>
            <p>Sehri: ${day.sehri}</p>
            <p>Iftar: ${day.iftar}</p>
        `;

        calendarContainer.appendChild(card);
    });
}

citySelect.addEventListener("change", () => {
    const country = countrySelect.value;
    const city = citySelect.value;

    if (country && city) {
        renderCalendar(country, city);
    }
});

loadCountries();
