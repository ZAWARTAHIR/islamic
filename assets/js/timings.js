const tableBody = document.querySelector("#timingsTable tbody");

async function renderTimings(country, city) {
    tableBody.innerHTML = "";

    const res = await fetch(`data/${country}/${city}.json`);
    const data = await res.json();

    const today = new Date().toISOString().split("T")[0];

    data.ramzan.forEach(day => {
        const row = document.createElement("tr");

        if (day.date === today) {
            row.classList.add("today");
        }

        row.innerHTML = `
            <td>${day.day}</td>
            <td>${day.date}</td>
            <td>${day.sehri}</td>
            <td>${day.iftar}</td>
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

loadCountries();
