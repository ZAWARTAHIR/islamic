// Shared lunar/theme script: adds theme toggle, animated moon/stars, and optional lunar page helpers.
(function(){
  const SUNCALC_CDN = 'https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.js';
  function ensureSunCalc(callback){
    if(window.SunCalc) return callback();
    const s = document.createElement('script');
    s.src = SUNCALC_CDN;
    s.onload = callback;
    s.onerror = function(){ console.warn('SunCalc failed to load'); callback(); };
    s.async = true; document.head.appendChild(s);
  }

  // create theme switch UI if not present
  function createThemeSwitch(){
    if(document.getElementById('themeToggle')) return;
    const html = `
      <span style="font-size:1.2em;">🌙</span>
      <div class="theme-toggle" id="themeToggle"><div class="toggle-ball"></div>
        <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="#ffe066"/></svg>
      </div>
      <span style="font-size:1.2em;">🌟</span>
    `;
    // Prefer injecting into navbar placeholder so toggle appears in navbar like other pages
    const placeholder = document.getElementById('navbarThemePlaceholder');
    if(placeholder){
      const wrapper = document.createElement('div');
      wrapper.className = 'theme-switch navbar-toggle';
      wrapper.innerHTML = html;
      placeholder.appendChild(wrapper);
      return;
    }
    // fallback: Place fixed top-right switch
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-switch';
    wrapper.style.position = 'fixed';
    wrapper.style.right = '16px';
    wrapper.style.top = '16px';
    wrapper.style.zIndex = 10000;
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
  }

  // theme engine based on user-provided script (simplified)
  let moon = null, stars = [], animFrame = null;
  let mouseX = 0.5, mouseY = 0.5; let moonX=null, moonY=null;

  function setTheme(theme){
    document.body.classList.remove('light','dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
    const toggle = document.getElementById('themeToggle');
    if(toggle) toggle.classList.toggle('light', theme === 'light');
    // remove old elements
    document.querySelectorAll('.moon, .sun, .star, .star-dark').forEach(e=>e.remove());
    // add moon
    moon = document.createElement('div'); moon.className = 'moon'; moon.style.width='120px'; moon.style.height='120px'; moon.style.left = 'calc(80vw - 60px)'; moon.style.top='calc(10vh + 20px)'; document.body.appendChild(moon);
    // stars
    stars = [];
    const isDark = theme === 'dark';
    for(let i=0;i<20;i++){
      const star = document.createElement('div');
      star.className = isDark? 'star-dark' : 'star';
      const size = 3 + Math.random()*4;
      star.style.width = star.style.height = size+'px';
      star.style.left = (Math.random()*100)+'vw';
      star.style.top = (Math.random()*100)+'vh';
      star.style.opacity = 0.6 + Math.random()*0.4;
      star.style.animationDuration = (1.2 + Math.random())+'s';
      document.body.appendChild(star); stars.push(star);
    }
    // render phase for moon if SunCalc present
    ensureSunCalc(()=>{ updateMoonPhaseMoon(); updateMoonPhaseIcon(); });
    // reset animation positions
    moonX = null; moonY = null; mouseX=0.5; mouseY=0.5;
  }

  function toggleTheme(){ setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'); }

  // mouse tracking and animation
  document.addEventListener('mousemove', e=>{ mouseX = e.clientX / window.innerWidth; mouseY = e.clientY / window.innerHeight; });
  function animate(){
    if(moon){
      const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
      let targetMoonX = theme==='dark'? (30 + mouseX*60) : (60 + mouseX*30);
      let targetMoonY = theme==='dark'? (10 + mouseY*60) : (5 + mouseY*20);
      if(moonX===null) moonX = targetMoonX; if(moonY===null) moonY = targetMoonY;
      moonX += (targetMoonX - moonX) * 0.35; moonY += (targetMoonY - moonY) * 0.35;
      moon.style.left = `calc(${moonX}vw - 60px)`; moon.style.top = `calc(${moonY}vh + 0px)`;
    }
    if(stars && stars.length){
      for(let i=0;i<stars.length;i++){
        const dx = (mouseX-0.5) * 30 * (i%5);
        const dy = (mouseY-0.5) * 30 * (i%7);
        const sx = (parseFloat(stars[i].dataset._sx)||0) + (dx - (parseFloat(stars[i].dataset._sx)||0))*0.35;
        const sy = (parseFloat(stars[i].dataset._sy)||0) + (dy - (parseFloat(stars[i].dataset._sy)||0))*0.35;
        stars[i].dataset._sx = sx; stars[i].dataset._sy = sy;
        stars[i].style.transform = `translate(${sx}px, ${sy}px)`;
      }
    }
    animFrame = requestAnimationFrame(animate);
  }
  animate();

  // moon phase rendering (small icon & large moon)
  function renderMoonPhaseIcon(phase){
    const el = document.getElementById('moonPhaseIcon'); if(!el) return;
    let svg='';
    if (phase < 0.02 || phase > 0.98){ svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#222" stroke="#bfcfff" stroke-width="2"/></svg>`; }
    else if (phase < 0.24) { svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#bfcfff"/><path d="M20 4 A16 16 0 0 1 20 36 A12 16 0 0 0 20 4" fill="#222"/></svg>`; }
    else if (phase < 0.26) { svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#bfcfff"/><rect x="20" y="4" width="16" height="32" fill="#222"/></svg>`; }
    else if (phase < 0.49) { svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#bfcfff"/><path d="M20 4 A16 16 0 0 1 20 36 A8 16 0 0 0 20 4" fill="#222"/></svg>`; }
    else if (phase < 0.51) { svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#fff" stroke="#bfcfff" stroke-width="2"/></svg>`; }
    else if (phase < 0.74) { svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#bfcfff"/><path d="M20 4 A16 16 0 0 0 20 36 A8 16 0 0 1 20 4" fill="#222"/></svg>`; }
    else if (phase < 0.76) { svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#bfcfff"/><rect x="4" y="4" width="16" height="32" fill="#222"/></svg>`; }
    else { svg = `<svg class="moon-phase-svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#bfcfff"/><path d="M20 4 A16 16 0 0 0 20 36 A12 16 0 0 1 20 4" fill="#222"/></svg>`; }
    el.innerHTML = svg;
  }
  function renderMoonPhaseMoon(phase){
    const m = document.querySelector('.moon'); if(!m) return;
    let svg='';
    const isLight = document.body.classList.contains('light');
    if(isLight){
      if (phase < 0.02 || phase > 0.98) svg = `<svg class="moon-svg-phase" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="#ffe066" stroke="#ffe066" stroke-width="6"/></svg>`;
      else svg = `<svg class="moon-svg-phase" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="#ffe066"/></svg>`;
    } else {
      if (phase < 0.02 || phase > 0.98) svg = `<svg class="moon-svg-phase" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="#222" stroke="#bfcfff" stroke-width="6"/></svg>`;
      else svg = `<svg class="moon-svg-phase" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="#bfcfff"/></svg>`;
    }
    m.innerHTML = svg;
  }
  function updateMoonPhaseIcon(){ ensureSunCalc(()=>{ const now=new Date(); const phase = SunCalc.getMoonIllumination(now).phase; renderMoonPhaseIcon(phase); }); }
  function updateMoonPhaseMoon(){ ensureSunCalc(()=>{ const now=new Date(); const phase = SunCalc.getMoonIllumination(now).phase; renderMoonPhaseMoon(phase); }); }
  setInterval(updateMoonPhaseIcon, 60*60*1000); setInterval(updateMoonPhaseMoon, 60*60*1000);

  // Initialization on DOM ready
  function init(){
    createThemeSwitch();
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    // mark body so CSS stays scoped to pages where this script runs
    document.body.classList.add('lunar-enabled');
    setTheme(initial);
    // attach toggle
    const toggle = document.getElementById('themeToggle');
    if(toggle) toggle.addEventListener('click', toggleTheme);
    // small icon update loop
    updateMoonPhaseIcon(); updateMoonPhaseMoon();

    // If lunar page specific elements exist, initialize those features
    const tzSelect = document.getElementById('timezone');
    if(tzSelect){
      // populate timezone list
      const tzs = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [Intl.DateTimeFormat().resolvedOptions().timeZone];
      tzs.forEach(tz=>{ const opt=document.createElement('option'); opt.value=tz; opt.textContent=tz; tzSelect.appendChild(opt); });
      tzSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // start simple update loop if elements exist
      const gregorianDiv = document.getElementById('gregorian');
      const sunsetDiv = document.getElementById('sunset');
      const islamicDiv = document.getElementById('islamic');
      const prayerGrid = document.getElementById('prayerGrid');
      function formatDate(date,tz){ return new Date(date).toLocaleString('en-GB',{timeZone:tz, hour12:false}); }
      function getIslamicDate(now,sunset){
        let islamicDayStart = now >= sunset ? sunset : new Date(sunset.getTime() - 24*3600*1000);
        const islamicEpoch = new Date(Date.UTC(622,6,19,18,0,0));
        const msPerDay = 24*60*60*1000;
        const daysSinceEpoch = Math.floor((islamicDayStart.getTime() - islamicEpoch.getTime())/msPerDay);
        let days = daysSinceEpoch; let year=1; let month=1; let day=1;
        const monthNames = ['al-Muḥarram','Ṣafar','Rabīʿ al-ʾAwwal','Rabīʿ ath-Thānī','Jumādā al-ʾŪlā','Jumādā ath-Thāniyah','Rajab','Shaʿbān','Ramaḍān','Shawwāl','Ḏū al-Qaʿdah','Ḏū al-Ḥijjah'];
        while(true){ const isShortYear = year % 3 === 0; const monthsInYear = isShortYear ? 12 : 13; let monthLens=[]; for(let m=0;m<monthsInYear;m++) monthLens.push(m%2===0?30:29); const yearLen = monthLens.reduce((a,b)=>a+b,0); if(days < yearLen){ for(let m=0;m<monthsInYear;m++){ if(days < monthLens[m]){ month = m+1; day = days+1; break; } else days -= monthLens[m]; } break; } else { days -= yearLen; year++; } }
        let monthName = monthNames[month-1] || `Month ${month}`;
        return `Year ${year}, ${monthName}${(year % 3 === 0 && month === 13) ? ' (deleted this year)' : ''}, Day ${day}`;
      }
      function update(){
        const tz = tzSelect.value; const now = new Date();
        ensureSunCalc(()=>{ const times = SunCalc.getTimes(now,21.4225,39.8262); const sunset = times.sunset; if(gregorianDiv) gregorianDiv.textContent = `Current Gregorian: ${formatDate(now,tz)}`; if(sunsetDiv) sunsetDiv.textContent = `Sunset Today: ${formatDate(sunset,tz)}`; if(islamicDiv) islamicDiv.textContent = `Islamic (Lunar): ${getIslamicDate(now,sunset)}`; });
      }
      setInterval(update,1000); tzSelect.addEventListener('input', update); update();

      // prayer times
      function calculatePrayerTimes(date,lat,lon){
        const times = SunCalc.getTimes(date,lat,lon);
        // Use SunCalc-derived times as a best-effort baseline. We'll try to override Asr with Aladhan API when possible.
        return {
          fajr: times.dawn,
          dhuhr: times.solarNoon,
          // temporary placeholder; will attempt to replace with API-provided Asr
          asr: times.sunset,
          maghrib: times.sunset,
          isha: times.dusk
        };
      }

      function getCurrentPrayer(pt, now){
        const prayers = [
          {name:'Fajr',time:pt.fajr},
          {name:'Dhuhr',time:pt.dhuhr},
          {name:'Asr',time:pt.asr},
          {name:'Maghrib',time:pt.maghrib},
          {name:'Isha',time:pt.isha}
        ];
        for(let i=0;i<prayers.length;i++){
          const next = prayers[(i+1)%prayers.length];
          if(now >= prayers[i].time && now < next.time) return prayers[i].name;
        }
        return 'Fajr';
      }

      async function updatePrayerTimes(){
        const now=new Date();
        const lat = 21.4225; const lon = 39.8262; // default to Makkah for demo
        let pt = calculatePrayerTimes(now, lat, lon);
        const tz = tzSelect.value;

        // Try to fetch authoritative prayer times from Aladhan and override Asr if available
        try {
          const url = `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&method=3`;
          const r = await fetch(url);
          const j = await r.json();
          if (j && j.data && j.data.timings && j.data.timings.Asr) {
            const asrStr = j.data.timings.Asr.replace(/\s*\(.*$/,'').trim();
            const m = asrStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
            if (m) {
              let hh = parseInt(m[1],10), mm = parseInt(m[2],10);
              const ampm = (m[3]||'').toUpperCase();
              if (ampm === 'PM' && hh < 12) hh += 12;
              if (ampm === 'AM' && hh === 12) hh = 0;
              pt.asr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
            }
          }
        } catch(e) {
          // ignore fetch errors and keep SunCalc baseline
        }

        const current = getCurrentPrayer(pt,now);
        if(prayerGrid) {
          prayerGrid.innerHTML='';
          const arr = [{name:'Fajr',time:pt.fajr},{name:'Dhuhr',time:pt.dhuhr},{name:'Asr',time:pt.asr},{name:'Maghrib',time:pt.maghrib},{name:'Isha',time:pt.isha}];
          arr.forEach(p=>{
            const item = document.createElement('div');
            item.className = `prayer-item ${p.name===current?'current':''}`;
            item.innerHTML = `<span class="prayer-name">${p.name}</span><span class="prayer-time">${formatDate(p.time,tz).split(' ')[1]||'--'}</span>`;
            prayerGrid.appendChild(item);
          });
        }
      }
      setInterval(updatePrayerTimes, 60*1000); updatePrayerTimes();

      // hide overlay after successful render of initial data
      try{ hideLoadingOverlay(); }catch(e){}

    }

  // hide the loading overlay (safe no-op if element missing)
  function hideLoadingOverlay(){
    try{
      const o = document.getElementById('loading-overlay');
      if(!o) return;
      o.classList.add('hide');
      setTimeout(()=>{ if(o.parentNode) o.parentNode.removeChild(o); }, 500);
    }catch(e){ console.warn('hideLoadingOverlay error', e); }
  }

  // fallback: ensure overlay removed even if some init path fails
  setTimeout(hideLoadingOverlay, 2500);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
