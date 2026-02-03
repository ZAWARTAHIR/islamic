const statusEl = document.getElementById("timingsStatus");

function parseTimeToDate(timeStr){
    if(!timeStr) return null;
    const m = (''+timeStr).match(/(\d{1,2}):(\d{2})/);
    if(!m) return null;
    const hh = parseInt(m[1],10), mm = parseInt(m[2],10);
    const d = new Date(); d.setHours(hh, mm, 0, 0); return d;
}
function formatTo12(d){ if(!d) return '--'; return d.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit', hour12: true}); }
function formatTo24(d){ if(!d) return '--'; return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false}); }

async function loadTodayPrayerTimings(country, city) {
    statusEl.textContent = "Loading today's prayer timings...";

    try {
        const asrEl = document.getElementById('asrMethod');
        const school = (asrEl && asrEl.value === 'hanafi') ? 1 : 0; // 0 = Standard, 1 = Hanafi
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3&school=${school}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!json || !json.data || !json.data.timings) {
            throw new Error("No data");
        }

        const t = json.data.timings;
        const date = json.data.date.gregorian.date;

        document.getElementById("prayerDate").textContent = date;

        const prayers = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
        const timesMap = {};
        prayers.forEach(name => {
            const raw = t[name];
            const parsed = parseTimeToDate(raw);
            const el12 = document.getElementById(name.toLowerCase() + 'Time12');
            const el24 = document.getElementById(name.toLowerCase() + 'Time24');
            if(el12) el12.textContent = parsed ? formatTo12(parsed) : (raw || '--');
            if(el24) el24.textContent = parsed ? formatTo24(parsed) : (raw || '--');
            timesMap[name] = parsed;
        });

        // expose for debugging / updates
        window.prayerTimesToday = timesMap;

        statusEl.textContent = `Prayer timings for ${city}`;

        // update current prayer highlight
        updateCurrentPrayer(timesMap);

        // Also fetch monthly calendar and compare today's Asr between endpoints
        (async function(){
            try {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1;
                const asrEl = document.getElementById('asrMethod');
                const school = (asrEl && asrEl.value === 'hanafi') ? 1 : 0;
                const calUrl = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=3&school=${school}`;
                const calRes = await fetch(calUrl);
                const calJson = await calRes.json();
                const compEl = document.getElementById('comparisonNote');
                if (!calJson || !calJson.data || !Array.isArray(calJson.data)) {
                    if (compEl) { compEl.style.display='block'; compEl.textContent = 'Calendar comparison not available.'; }
                    return;
                }
                const calEntry = calJson.data.find(d=>{ try { return parseInt(d.date && d.date.gregorian && d.date.gregorian.day,10) === today.getDate(); } catch(e){ return false; } });
                if (!calEntry || !calEntry.timings) {
                    if (compEl) { compEl.style.display='block'; compEl.textContent = 'Calendar comparison not available for today.'; }
                    return;
                }
                const calAsr = (calEntry.timings.Asr || '').replace(/\s*\(.*$/,'').trim();
                const apiAsr = (t.Asr || '').replace(/\s*\(.*$/,'').trim();
                if (calAsr && apiAsr && calAsr !== apiAsr) {
                    if (compEl) { compEl.style.display='block'; compEl.textContent = `Note: monthly calendar Asr = ${calAsr}, TimingsByCity Asr = ${apiAsr}. Try switching Asr method (Standard/Hanafi) if it doesn't match local mosque.`; }
                } else {
                    if (compEl) { compEl.style.display='block'; compEl.textContent = `Aladhan endpoints agree on Asr (${apiAsr || calAsr || 'N/A'}).`; }
                }
            } catch(e) {
                const compEl = document.getElementById('comparisonNote'); if (compEl) { compEl.style.display='block'; compEl.textContent = 'Calendar comparison failed.'; }
            }
        })();

    } catch (err) {
        console.error(err);
        statusEl.textContent = "Unable to load prayer timings.";
    }
}

function updateCurrentPrayer(timesMap){
    if(!timesMap) return;
    const now = new Date();
    const prayers = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
    let current = null;

    for(let i=0;i<prayers.length;i++){
        const cur = prayers[i];
        const next = prayers[(i+1) % prayers.length];
        const curT = timesMap[cur];
        const nextT = timesMap[next];
        if(!curT) continue;
        if(now >= curT && (!nextT || now < nextT)) { current = cur; break; }
    }
    // if still not found (e.g., before Fajr), pick the first upcoming
    if(!current){
        for(let i=0;i<prayers.length;i++){ if(timesMap[prayers[i]] && now < timesMap[prayers[i]]){ current = prayers[i]; break; } }
        if(!current) current = 'Fajr';
    }

    // clear existing
    document.querySelectorAll('#prayerTable tbody tr').forEach(r=>r.classList.remove('current'));
    const sel = document.querySelector(`#prayerTable tbody tr[data-prayer="${current}"]`);
    if(sel) sel.classList.add('current');
}

// refresh highlight every minute
setInterval(()=>{ if(window.prayerTimesToday) updateCurrentPrayer(window.prayerTimesToday); }, 60*1000);

citySelect.addEventListener("change", () => {
    const city = citySelect.value;
    const country =
        countrySelect.options[countrySelect.selectedIndex]?.textContent;

    if (!city || !country) return;
    loadTodayPrayerTimings(country, city);
});

loadCountries();