document.addEventListener('DOMContentLoaded', async function() {
    let currentUser = null;
    try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if(data.success) { currentUser = data.user; }
    } catch(e) { console.error(e); }

    function saveAnalysis(type, inputs, results) {
        fetch('/api/analysis/save', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ type: type, inputs: inputs, results: results })
        }).catch(err => console.error(err));
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.innerHTML = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = '#2ecc71';
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.zIndex = '9999';
        toast.style.fontWeight = '600';
        toast.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- PREFILL & LOGIC FOR YIELD PREDICTION ---
    const yForm = document.getElementById('yield-form');
    if (yForm) {
        const sizeInput = document.getElementById('y-size');
        const cropInput = document.getElementById('y-crop');
        const otherInput = document.getElementById('y-crop-other');
        
        if (sizeInput) sizeInput.value = currentUser.size;
        
        if (cropInput) {
            const options = Array.from(cropInput.options).map(o => o.value);
            if (options.includes(currentUser.crop)) {
                cropInput.value = currentUser.crop;
            } else {
                cropInput.value = 'Other';
                if (otherInput) {
                    otherInput.style.display = 'block';
                    otherInput.value = currentUser.crop;
                    otherInput.setAttribute('required', 'true');
                }
            }
            
            cropInput.addEventListener('change', function() {
                if (cropInput.value === 'Other') {
                    if (otherInput) {
                        otherInput.style.display = 'block';
                        otherInput.setAttribute('required', 'true');
                    }
                } else {
                    if (otherInput) {
                        otherInput.style.display = 'none';
                        otherInput.removeAttribute('required');
                    }
                }
            });
        }

        yForm.addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('yield-placeholder').style.display = 'none';
            document.getElementById('yield-result').style.display = 'block';
            
            const size = parseFloat(sizeInput.value) || 0;
            let crop = cropInput.value;
            if (crop === 'Other' && otherInput) crop = otherInput.value;
            
            let totalYield = size * 22; // dummy logic
            let profit = totalYield * 2500;
            
            document.getElementById('res-yield').textContent = totalYield + ' Quintals';
            document.getElementById('res-yield').style.color = '#2ecc71';
            document.getElementById('res-profit').textContent = '₹' + profit.toLocaleString('en-IN');
            document.getElementById('res-profit').style.color = '#2ecc71';
            document.getElementById('res-dur').textContent = (crop === 'Cotton' ? '150' : '110') + ' Days';
            document.getElementById('res-dur').style.color = '#333';
            document.getElementById('res-qual').textContent = 'Grade A (Premium)';
            document.getElementById('res-qual').style.color = '#333';

            showToast('✅ Analysis completed successfully.');
            saveAnalysis('Yield Prediction', { crop: crop, size: size }, { total_yield: totalYield, profit: profit });
        });
    }

    // --- PREFILL & LOGIC FOR SOIL HEALTH ---
    const sForm = document.getElementById('soil-form');
    if (sForm) {
        sForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const ph = parseFloat(document.getElementById('soil-ph').value) || 6.5;
            
            const pEl = document.getElementById('soil-placeholder');
            if (pEl) pEl.style.display = 'none';
            const emptyText = document.getElementById('soil-empty-text');
            if (emptyText) emptyText.style.display = 'none';

            document.getElementById('soil-result').style.display = 'block';
            
            const statusEl = document.getElementById('res-status');
            const fertEl = document.getElementById('res-fert');
            
            let status = '';
            let fert = '';
            
            if(ph < 6) {
                status = 'Acidic (Requires Lime)';
                fert = 'Calcium Carbonate, Rock Phosphate';
            } else if (ph > 7.5) {
                status = 'Alkaline (Requires Gypsum)';
                fert = 'Gypsum, Elemental Sulfur';
            } else {
                status = 'Optimal & Healthy';
                fert = 'Standard NPK (120:60:40)';
            }
            
            if(statusEl) {
                statusEl.textContent = status;
                statusEl.style.color = ph >= 6 && ph <= 7.5 ? '#2ecc71' : '#e74c3c';
            }
            if(fertEl) {
                fertEl.textContent = fert;
                fertEl.style.color = '#333';
            }

            showToast('✅ Analysis completed successfully.');
            saveAnalysis('Soil Health', { ph }, { status, fert });
        });
    }

    // --- PREFILL & LOGIC FOR IRRIGATION ---
    const iForm = document.getElementById('irrigation-form');
    if (iForm) {
        const sizeInput = document.getElementById('i-size');
        if (sizeInput) sizeInput.value = currentUser.size;

        iForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const pEl = document.getElementById('irrigation-placeholder');
            if (pEl) pEl.style.display = 'none';
            const emptyText = document.getElementById('irrigation-empty-text');
            if (emptyText) emptyText.style.display = 'none';

            document.getElementById('irrigation-result').style.display = 'block';
            
            const size = parseFloat(sizeInput.value) || currentUser.size;
            const soil = document.getElementById('i-soil').value;
            const source = document.getElementById('i-source').value;
            
            let freq = 'Every 3 Days';
            let warning = 'Monitor soil moisture regularly.';
            
            if(soil.includes('Sandy')) {
                freq = 'Every 2 Days (Split)';
                warning = 'High percolation. Use drip irrigation.';
            } else if (soil.includes('Clay')) {
                freq = 'Every 5 Days';
                warning = 'Prone to waterlogging. Ensure drainage.';
            }
            
            if(source === 'Drip System') freq = 'Daily (Micro-dosing)';
            
            // Weather Simulation
            const temp = Math.floor(Math.random() * 20) + 20; // 20-40 C
            const rainChance = Math.floor(Math.random() * 100); // 0-100 %
            const windSpeed = Math.floor(Math.random() * 50); // 0-50 km/h
            
            const waterEl = document.getElementById('res-water');
            const freqEl = document.getElementById('res-freq');
            const warnEl = document.getElementById('res-warn');
            
            if(waterEl) {
                waterEl.textContent = 'Moderate';
                waterEl.style.color = '#333';
            }
            if(freqEl) {
                freqEl.textContent = freq;
                freqEl.style.color = '#333';
            }
            if(warnEl) warnEl.textContent = warning;

            showToast('✅ Analysis completed successfully.');
            saveAnalysis('Irrigation Plan', { temp, rainChance, windSpeed }, { freq, warning });
        });
    }

    // --- PREFILL & LOGIC FOR CROP REC ---
    const cForm = document.getElementById('crop-form');
    if (cForm) {
        cForm.addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('crop-placeholder').style.display = 'none';
            document.getElementById('crop-result').style.display = 'block';
            
            const seasonEl = document.getElementById('c-season');
            const season = seasonEl ? seasonEl.value : '';
            
            const recEl = document.getElementById('res-rec');
            const timeEl = document.getElementById('res-time');
            const confEl = document.getElementById('res-conf');
            
            let recCrop = 'Wheat';
            let conf = '92%';
            let time = 'November to December';
            
            if (season.includes('Kharif')) {
                recCrop = 'Rice (Paddy)'; conf = '96.5%'; time = 'June to July';
            } else if (season.includes('Rabi')) {
                recCrop = 'Wheat'; conf = '92.1%'; time = 'November to December';
            } else if (season.includes('Zaid')) {
                recCrop = 'Watermelon / Cucumber'; conf = '88.4%'; time = 'March to April';
            }
            
            const reasonEl = document.getElementById('res-reason');
            let reasonStr = 'Optimal based on seasonal constraints and average temperature.';
            
            if (season.includes('Kharif')) {
                reasonStr = 'High humidity and rainfall during Kharif season are ideal for Rice.';
            } else if (season.includes('Rabi')) {
                reasonStr = 'Lower temperatures and moderate water availability suit Wheat perfectly.';
            } else if (season.includes('Zaid')) {
                reasonStr = 'Warm, dry weather is optimal for short-duration crops like Watermelon.';
            }

            if (recEl) { recEl.textContent = recCrop; recEl.style.color = '#2ecc71'; }
            if (timeEl) { timeEl.textContent = time; timeEl.style.color = '#333'; }
            if (confEl) { confEl.textContent = conf; confEl.style.color = '#333'; }
            if (reasonEl) { reasonEl.textContent = reasonStr; reasonEl.style.color = '#333'; }
            
            showToast('✅ Analysis completed successfully.');
            saveAnalysis('Crop Recommendation', { season: season }, { recommended_crop: recCrop, confidence: conf, time: time, reason: reasonStr });
        });
    }
});
