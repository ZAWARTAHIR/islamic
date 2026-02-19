// (function(){
//   'use strict';

//   async function detectAndSelectCityByIP(){
//     try {
//       const countrySelect = document.getElementById('countrySelect');
//       const citySelect = document.getElementById('citySelect');
//       if (!countrySelect || !citySelect) return;

//       // Respect saved selection
//       if (typeof loadSelection === 'function'){
//         const s = loadSelection();
//         if (s && (s.country || s.city)) { console.log('geoip: saved selection exists, skipping detection'); return; }
//       }

//       const res = await fetch('https://ipapi.co/json/');
//       if (!res.ok) throw new Error('ipapi failed '+res.status);
//       const data = await res.json();
//       const ipCity = (data.city || '').trim();
//       const ipCountry = (data.country_name || data.country || '').trim();
//       console.log('geoip detected', ipCity, ipCountry);
//       if (!ipCountry) return;

//       const nCountry = ipCountry.toLowerCase();

//       // find a matching country option
//       let matchedCountry = null;
//       for (let i=0;i<countrySelect.options.length;i++){
//         const opt = countrySelect.options[i];
//         if (!opt.value) continue;
//         const name = (opt.textContent||'').toLowerCase();
//         const id = (opt.value||'').toLowerCase();
//         if (name === nCountry || id === nCountry || name.includes(nCountry) || nCountry.includes(name)) { matchedCountry = opt.value; break; }
//       }

//       if (matchedCountry){
//         countrySelect.value = matchedCountry;
//         countrySelect.dispatchEvent(new Event('change'));

//         if (typeof loadCities === 'function') await loadCities(matchedCountry);

//         if (ipCity){
//           const region = (data.region || data.region_code || '').toLowerCase();

//           function normalize(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim(); }
//           function nospace(s){ return normalize(s).replace(/\s+/g,''); }

//           // Levenshtein distance for fuzzy matching
//           function levenshtein(a, b){
//             if (a === b) return 0;
//             const al = a.length, bl = b.length;
//             if (al === 0) return bl; if (bl === 0) return al;
//             const dp = new Array(al + 1);
//             for (let i = 0; i <= al; i++) { dp[i] = new Array(bl + 1); dp[i][0] = i; }
//             for (let j = 0; j <= bl; j++) dp[0][j] = j;
//             for (let i = 1; i <= al; i++){
//               for (let j = 1; j <= bl; j++){
//                 const cost = a[i-1] === b[j-1] ? 0 : 1;
//                 dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
//               }
//             }
//             return dp[al][bl];
//           }

//           const targetNorm = normalize(ipCity);
//           const targetNo = nospace(ipCity);

//           const candidates = [];
//           for (let i=0;i<citySelect.options.length;i++){
//             const opt = citySelect.options[i];
//             if (!opt.value) continue;
//             const txt = (opt.textContent||'').trim();
//             const val = (opt.value||'').trim();
//             candidates.push({opt, txt, val, norm: normalize(txt), nospace: nospace(txt)});
//           }

//           // 1) exact normalized match
//           let matchedCity = null;
//           for (const c of candidates){ if (c.norm === targetNorm || c.nospace === targetNo) { matchedCity = c.opt.value; break; } }

//           // 2) token match (common token)
//           if (!matchedCity){
//             const tTokens = targetNorm.split(/\s+/).filter(Boolean);
//             for (const c of candidates){
//               const cTokens = c.norm.split(/\s+/).filter(Boolean);
//               if (tTokens.some(tok => cTokens.includes(tok))) { matchedCity = c.opt.value; break; }
//             }
//           }

//           // 3) startsWith / includes
//           if (!matchedCity){
//             for (const c of candidates){ if (c.norm.startsWith(targetNorm) || targetNorm.startsWith(c.norm) || c.norm.includes(targetNorm) || targetNorm.includes(c.norm)) { matchedCity = c.opt.value; break; } }
//           }

//           // 4) region-based weak match
//           if (!matchedCity && region){
//             for (const c of candidates){ if (c.norm.includes(region) || region.includes(c.norm)) { matchedCity = c.opt.value; break; } }
//           }

//           // 5) fuzzy Levenshtein best candidate
//           if (!matchedCity){
//             let best = {dist: Infinity, val: null};
//             for (const c of candidates){
//               const d = levenshtein(c.nospace, targetNo);
//               if (d < best.dist){ best = {dist: d, val: c.opt.value, len: Math.max(c.nospace.length, targetNo.length)}; }
//             }
//             if (best.val !== null){
//               const rel = best.dist / Math.max(1, best.len);
//               if (best.dist <= 2 || rel <= 0.25) matchedCity = best.val;
//             }
//           }

//           if (matchedCity){
//             citySelect.value = matchedCity;
//             citySelect.dispatchEvent(new Event('change'));
//             if (typeof saveSelection === 'function') saveSelection(countrySelect.value, citySelect.value);
//             console.log('geoip: selected (fuzzy)', matchedCountry, matchedCity, 'from', ipCity);
//             return;
//           }
//         }

//         // Save country only if city could not be matched
//         if (typeof saveSelection === 'function') saveSelection(countrySelect.value, '');
//         console.log('geoip: matched country only', matchedCountry);
//       } else {
//         console.log('geoip: no country match for', ipCountry);
//       }

//     } catch (e) {
//       console.warn('geoip detect failed', e);
//     }
//   }

//   window.detectAndSelectCityByIP = detectAndSelectCityByIP;
// })();
