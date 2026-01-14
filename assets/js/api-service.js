async function buildAndFetchHijriCalendar({hijriYear, hijriMonth, countryLabel, cityLabel, address = '', method = '3', shafaq = 'general', tune = '', timezonestring = 'UTC', calendarMethod = 'UAQ'}) {
    if (!hijriYear || !hijriMonth) throw new Error('Missing hijri year/month');

    // address may be provided directly (free-text). Otherwise build from city+country.
    let finalAddress = address;
    if (!finalAddress) {
        if (!countryLabel || !cityLabel) throw new Error('Missing parameters: country or city or address required');
        finalAddress = `${cityLabel}, ${countryLabel}`;
    }

    const encodedAddress = encodeURIComponent(finalAddress);

    let url = `https://api.aladhan.com/v1/hijriCalendarByAddress/${encodeURIComponent(hijriYear)}/${encodeURIComponent(hijriMonth)}?address=${encodedAddress}`;
    url += `&method=${encodeURIComponent(method)}`;
    if (shafaq) url += `&shafaq=${encodeURIComponent(shafaq)}`;
    if (tune) url += `&tune=${encodeURIComponent(tune)}`;
    if (timezonestring) url += `&timezonestring=${encodeURIComponent(timezonestring)}`;
    if (calendarMethod) url += `&calendarMethod=${encodeURIComponent(calendarMethod)}`;

    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    if (!json || !json.data || !Array.isArray(json.data)) throw new Error('Invalid API response');

    // Map response to simplified structure
    const mapped = json.data.map((item, idx) => {
        const timings = item.timings || {};
        // prefer Imsak for Sehri end if present
        const sehri = timings.Imsak || timings.Fajr || '';
        const iftar = timings.Maghrib || timings.Sunset || '';
        const hijri = item.date && item.date.hijri ? item.date.hijri : null;
        const greg = item.date && item.date.gregorian ? item.date.gregorian : null;

        return {
            day: (hijri && hijri.day) || (idx + 1),
            hijriDate: hijri ? hijri.date : (hijri && hijri.day) || '',
            gregorianDate: greg ? greg.date : '',
            sehri: sehri.replace(/\s*\(.*$/,'').trim(),
            iftar: iftar.replace(/\s*\(.*$/,'').trim(),
            raw: { timings, hijri, greg }
        };
    });

    return mapped;
}

window.buildAndFetchHijriCalendar = buildAndFetchHijriCalendar;

async function fetchTodayTimingsByAddress({address, method = '3', timezonestring = 'UTC', tune = ''}) {
    if (!address) throw new Error('Missing address');
    const addr = encodeURIComponent(address);
    let url = `https://api.aladhan.com/v1/timingsByAddress?address=${addr}`;
    url += `&method=${encodeURIComponent(method)}`;
    if (timezonestring) url += `&timezonestring=${encodeURIComponent(timezonestring)}`;
    if (tune) url += `&tune=${encodeURIComponent(tune)}`;

    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const json = await res.json();
    if (!json || !json.data || !json.data.timings) throw new Error('Invalid API response');

    return json.data; // contains timings, date, meta
}

window.fetchTodayTimingsByAddress = fetchTodayTimingsByAddress;