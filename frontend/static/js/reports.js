document.addEventListener('DOMContentLoaded', async function() {
    const container = document.querySelector('.input-card').parentElement;
    const filterSelect = document.getElementById('report-filter');
    const exportDiv = document.querySelector('div[style*="display: none"], div[style*="display: flex"]');
    const excelBtn = document.querySelector('a[href^="/api/reports/export/excel"]');
    const pdfBtn = document.querySelector('a[href^="/api/reports/export/pdf"]');
    let allReports = [];
    
    // Save the original empty state HTML
    const emptyStateHTML = container.innerHTML;

    async function fetchReports() {
        try {
            const res = await fetch('/api/reports');
            const data = await res.json();
            if (data.success) {
                allReports = data.reports;
                renderReports();
            }
        } catch(e) { console.error(e); }
    }

    function renderReports() {
        const selectedType = filterSelect ? filterSelect.value : 'All';
        const filteredReports = allReports.filter(r => selectedType === 'All' || r.type === selectedType);
        
        if (filteredReports.length === 0) {
            container.innerHTML = emptyStateHTML;
            container.style.display = 'flex';
            if (exportDiv) exportDiv.style.display = 'none';
        } else {
            container.innerHTML = '';
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            container.style.gap = '2rem';
            container.style.alignItems = 'start';
            
            filteredReports.forEach(analysis => {
                const dateStr = new Date(analysis.date).toLocaleDateString();
                const card = document.createElement('div');
                card.className = 'module-card';
                card.style.border = '1px solid var(--color-border)';
                card.style.borderRadius = 'var(--radius)';
                card.style.padding = '1.5rem';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                card.style.backgroundColor = '#fff';
                card.style.position = 'relative';

                let html = `
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3 style="color: var(--color-primary-dark); margin-top: 0; margin-bottom: 0.5rem; padding-right: 2rem;">${analysis.type}</h3>
                        <button class="delete-btn" data-id="${analysis.id}" style="background: transparent; border: none; color: #dc3545; cursor: pointer; font-size: 1.2rem; padding: 0;">🗑️</button>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">${dateStr}</p>
                    <h4 style="margin-bottom: 0.5rem; font-size: 0.95rem;">Inputs:</h4>
                    <ul style="font-size: 0.9rem; color: #555; margin-bottom: 1rem; padding-left: 1.2rem;">
                `;
                
                function formatKey(k) {
                    return k.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                }
                
                for (const [key, val] of Object.entries(analysis.input || {})) {
                    html += `<li><strong>${formatKey(key)}:</strong> ${val}</li>`;
                }
                
                html += `</ul><h4 style="margin-bottom: 0.5rem; font-size: 0.95rem;">Results:</h4><div style="background-color: #f8f9fa; padding: 1rem; border-radius: 8px; font-size: 0.9rem;">`;
                
                for (const [key, val] of Object.entries(analysis.output || {})) {
                    html += `<div style="margin-bottom: 0.3rem;"><strong>${formatKey(key)}:</strong> <span style="color: var(--color-primary);">${val}</span></div>`;
                }
                
                html += `</div>`;
                card.innerHTML = html;
                container.appendChild(card);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    if (confirm('Are you sure you want to delete this report?')) {
                        const id = this.getAttribute('data-id');
                        try {
                            const res = await fetch('/api/reports/' + id, { method: 'DELETE' });
                            const data = await res.json();
                            if (data.success) {
                                allReports = allReports.filter(r => r.id != id);
                                renderReports();
                            } else {
                                alert('Failed to delete report: ' + (data.message || ''));
                            }
                        } catch(err) {
                            alert('Failed to delete report.');
                            console.error(err);
                        }
                    }
                });
            });

            if (exportDiv) exportDiv.style.display = 'flex';
        }
        
        if (excelBtn) excelBtn.href = '/api/reports/export/excel' + (selectedType !== 'All' ? '?type=' + encodeURIComponent(selectedType) : '');
        if (pdfBtn) pdfBtn.href = '/api/reports/export/pdf' + (selectedType !== 'All' ? '?type=' + encodeURIComponent(selectedType) : '');
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', renderReports);
    }

    fetchReports();
});
