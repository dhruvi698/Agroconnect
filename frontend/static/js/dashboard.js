document.addEventListener('DOMContentLoaded', async function() {
    let currentUser = null;
    
    const greeting = document.getElementById('dash-greeting');
    const bFarmer = document.getElementById('dash-farmer');
    const bFarmName = document.getElementById('dash-farm-name');
    const bVillage = document.getElementById('dash-village');
    const bSize = document.getElementById('dash-size');
    const bCrop = document.getElementById('dash-crop');

    // Fetch Profile
    try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            populateData();
        }
    } catch (e) { console.error(e); }

    function populateData() {
        if (!currentUser) return;
        if (greeting) greeting.innerHTML = `Good Morning, ${currentUser.name.split(' ')[0]} 👋`;
        if (bFarmer) bFarmer.textContent = currentUser.name;
        if (bFarmName) bFarmName.textContent = currentUser.farm;
        if (bVillage) bVillage.textContent = currentUser.village;
        if (bSize) bSize.textContent = `${currentUser.size} Acres`;
        if (bCrop) bCrop.textContent = currentUser.crop;
    }

    // Edit Modal Logic
    const editBtn = document.getElementById('edit-profile-btn');
    const editModal = document.getElementById('edit-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const editForm = document.getElementById('edit-form');

    if (editBtn && editModal) {
        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!currentUser) return;
            document.getElementById('edit-farmer-name').value = currentUser.name;
            document.getElementById('edit-farm-name').value = currentUser.farm;
            document.getElementById('edit-village').value = currentUser.village;
            document.getElementById('edit-size').value = currentUser.size;
            
            const editCrop = document.getElementById('edit-crop');
            const otherCrop = document.getElementById('edit-crop-other');
            
            if (editCrop) {
                const options = Array.from(editCrop.options).map(o => o.value);
                if (options.includes(currentUser.crop)) {
                    editCrop.value = currentUser.crop;
                    if(otherCrop) {
                        otherCrop.style.display = 'none';
                        otherCrop.removeAttribute('required');
                    }
                } else {
                    editCrop.value = 'Other';
                    if(otherCrop) {
                        otherCrop.value = currentUser.crop;
                        otherCrop.style.display = 'block';
                        otherCrop.setAttribute('required', 'true');
                    }
                }
                
                editCrop.addEventListener('change', function() {
                    if (editCrop.value === 'Other') {
                        if(otherCrop) {
                            otherCrop.style.display = 'block';
                            otherCrop.setAttribute('required', 'true');
                        }
                    } else {
                        if(otherCrop) {
                            otherCrop.style.display = 'none';
                            otherCrop.removeAttribute('required');
                        }
                    }
                });
            }
            editModal.style.display = 'flex';
        });

        closeEditModal.addEventListener('click', function() {
            editModal.style.display = 'none';
        });

        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            let finalCrop = document.getElementById('edit-crop').value;
            if (finalCrop === 'Other') {
                finalCrop = document.getElementById('edit-crop-other').value.trim();
            }
            
            const payload = {
                name: document.getElementById('edit-farmer-name').value,
                farm: document.getElementById('edit-farm-name').value,
                village: document.getElementById('edit-village').value,
                size: document.getElementById('edit-size').value,
                crop: finalCrop
            };

            try {
                const response = await fetch('/api/user/profile/update', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if(result.success) {
                    currentUser.name = payload.name;
                    currentUser.farm = payload.farm;
                    currentUser.village = payload.village;
                    currentUser.size = payload.size;
                    currentUser.crop = payload.crop;
                    populateData();
                    editModal.style.display = 'none';
                } else {
                    alert('Update failed');
                }
            } catch(err) { console.error(err); }
        });
    }

    // Populate latest analysis
    const latestCard = document.getElementById('latest-analysis-content');
    if (latestCard) {
        fetch('/api/reports')
            .then(res => res.json())
            .then(data => {
                if(data.success && data.reports.length > 0) {
                    const latest = data.reports[0];
                    const dateStr = new Date(latest.date).toLocaleString();
                    let html = `
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <h4 style="color: var(--color-primary); font-size: 1.2rem; margin: 0;">${latest.type}</h4>
                            <p style="font-size: 0.85rem; color: #888; margin: 0;">Generated on: ${dateStr}</p>
                            <div style="margin-top: 1rem; padding: 1rem; background-color: var(--color-surface); border-radius: var(--radius); border: 1px solid var(--color-border);">
                    `;
                    
                    if (latest.inputs && Object.keys(latest.inputs).length > 0) {
                        for (const [key, val] of Object.entries(latest.inputs)) {
                            html += `<div style="margin-bottom: 0.3rem; font-size: 0.85rem; color: #555;"><strong>${key}:</strong> ${val}</div>`;
                        }
                        html += `<hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #ccc;">`;
                    }

                    for (const [key, val] of Object.entries(latest.results)) {
                        html += `<div style="margin-bottom: 0.5rem;"><strong style="text-transform: capitalize;">${key}:</strong> ${val}</div>`;
                    }
                    html += `</div></div>`;
                    latestCard.innerHTML = html;
                }
            }).catch(e => console.error(e));
    }
});