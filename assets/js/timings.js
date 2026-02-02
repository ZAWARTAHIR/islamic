const statusEl = document.getElementById("timingsStatus");

async function loadTodayPrayerTimings(country, city) {
    statusEl.textContent = "Loading today's prayer timings...";

    try {
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3`;
        const res = await fetch(url);
        const json = await res.json();

        if (!json || !json.data || !json.data.timings) {
            throw new Error("No data");
        }

        const t = json.data.timings;
        const date = json.data.date.gregorian.date;

        document.getElementById("prayerDate").textContent = date;
        document.getElementById("fajrTime").textContent = t.Fajr;
        document.getElementById("dhuhrTime").textContent = t.Dhuhr;
        document.getElementById("asrTime").textContent = t.Asr;
        document.getElementById("maghribTime").textContent = t.Maghrib;
        document.getElementById("ishaTime").textContent = t.Isha;

        statusEl.textContent = `Prayer timings for ${city}`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Unable to load prayer timings.";
    }
}

citySelect.addEventListener("change", () => {
    const city = citySelect.value;
    const country =
        countrySelect.options[countrySelect.selectedIndex]?.textContent;

    if (!city || !country) return;
    loadTodayPrayerTimings(country, city);
});

loadCountries();