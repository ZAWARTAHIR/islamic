function saveSelection(country, city) {
    try {
        localStorage.setItem("ramzanCountry", country || '');
        localStorage.setItem("ramzanCity", city || '');

        // Persist calculation method and custom address if present in DOM
        const methodEl = document.getElementById('methodSelect');
        const method = methodEl ? methodEl.value : '';
        localStorage.setItem('ramzanMethod', method || '');

        const customEl = document.getElementById('customAddressInput');
        const customVal = customEl ? customEl.value : '';
        localStorage.setItem('ramzanCustomAddress', customVal || '');

        const useCustomEl = document.getElementById('useCustomAddress');
        const useCustom = useCustomEl && useCustomEl.checked ? '1' : '';
        localStorage.setItem('ramzanUseCustom', useCustom);

        const tuneEl = document.getElementById('tuneInput');
        const tzEl = document.getElementById('timezoneInput');
        const calMethodEl = document.getElementById('calendarMethodSelect');
        const hijriY = document.getElementById('hijriYearInput');
        const hijriM = document.getElementById('hijriMonthInput');
        const shafaqEl = document.getElementById('shafaqSelect');

        localStorage.setItem('ramzanTune', tuneEl ? (tuneEl.value || '') : '');
        localStorage.setItem('ramzanTimezone', tzEl ? (tzEl.value || '') : '');
        localStorage.setItem('ramzanCalendarMethod', calMethodEl ? (calMethodEl.value || '') : '');
        localStorage.setItem('ramzanHijriYear', hijriY ? (hijriY.value || '') : '');
        localStorage.setItem('ramzanHijriMonth', hijriM ? (hijriM.value || '') : '');
        localStorage.setItem('ramzanShafaq', shafaqEl ? (shafaqEl.value || '') : '');

        const adv = document.getElementById('advancedToggle');
        const asrEl = document.getElementById('asrMethod');
        localStorage.setItem('ramzanAdvanced', adv && adv.checked ? '1' : '');
        localStorage.setItem('ramzanAsrMethod', asrEl ? (asrEl.value || '') : '');
    } catch (e) {
        console.warn('saveSelection failed', e);
    }
}

function loadSelection() {
    return {
        country: localStorage.getItem("ramzanCountry"),
        city: localStorage.getItem("ramzanCity"),
        method: localStorage.getItem('ramzanMethod') || '',
        customAddress: localStorage.getItem('ramzanCustomAddress') || '',
        useCustom: localStorage.getItem('ramzanUseCustom') === '1',
        tune: localStorage.getItem('ramzanTune') || '',
        timezone: localStorage.getItem('ramzanTimezone') || '',
        calendarMethod: localStorage.getItem('ramzanCalendarMethod') || '',
        hijriYear: localStorage.getItem('ramzanHijriYear') || '',
        hijriMonth: localStorage.getItem('ramzanHijriMonth') || '',
        shafaq: localStorage.getItem('ramzanShafaq') || '',
        asrMethod: localStorage.getItem('ramzanAsrMethod') || '',
        advanced: localStorage.getItem('ramzanAdvanced') === '1'
    };
}
