let _countdownInterval = null;
const countdownEl = document.getElementById('countdown');

// startCountdown accepts either (country,city) or an object with {target:Date, label: 'Sehri'|'Iftar', onFinish: function}
function startCountdown(arg1, arg2) {
    if (!countdownEl) return;
    // clear existing
    if (_countdownInterval) clearInterval(_countdownInterval);

    let target = null;
    let label = 'Time';
    let onFinish = null;

    if (arg1 && typeof arg1 === 'object' && arg1.target instanceof Date) {
        target = arg1.target;
        if (arg1.label) label = arg1.label;
        if (typeof arg1.onFinish === 'function') onFinish = arg1.onFinish;
    } else if (typeof arg1 === 'string' && typeof arg2 === 'string') {
        // fallback: fetch file and compute target (defaults to iftar)
        (async ()=>{
            try {
                const res = await fetch(`data/${arg1}/${arg2}.json`);
                let data = await res.json();
                if (!data.ramzan) {
                    const s = await fetch('data/sample-ramzan.json');
                    data = await s.json();
                }
                const today = new Date().toISOString().split('T')[0];
                const todayData = data.ramzan.find(d=>d.date===today) || data.ramzan[0];
                if (!todayData || !todayData.iftar) {
                    countdownEl.textContent = 'No iftar time available';
                    return;
                }
                const [h,m] = todayData.iftar.split(':').map(Number);
                const now = new Date();
                target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                runTimer(target, 'Iftar', () => {});
            } catch(e){ console.error(e); countdownEl.textContent='Countdown error' }
        })();
        return;
    }

    if (target) runTimer(target, label, onFinish);

    function runTimer(t, lbl, doneCallback) {
        function update(){
            const now = new Date();
            const diff = t - now;
            if (diff <= 0) {
                countdownEl.textContent = `${lbl} time!`;
                clearInterval(_countdownInterval);
                if (typeof doneCallback === 'function') doneCallback();
                return;
            }
            const hrs = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            countdownEl.textContent = `${lbl} in ${hrs}h ${mins}m ${secs}s`;
        }
        update();
        _countdownInterval = setInterval(update, 1000);
    }
}

window.startCountdown = startCountdown;
