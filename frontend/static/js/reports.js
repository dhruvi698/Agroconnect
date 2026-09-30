document.addEventListener('DOMContentLoaded', async function() {
    const container = document.querySelector('.input-card').parentElement;
    
    try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        
        if (data.success && data.reports.length > 0) {
            container.innerHTML = ''; // Clear empty state
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            container.style.gap = '2rem';
            container.style.alignItems = 'start';
        
            data.reports.forEach(analysis => {
                const dateStr = new Date(analysis.date).toLocaleDateString();
                
                const card = document.createElement('div');
                card.className = 'module-card';
                card.style.border = '1px solid var(--color-border)';
                card.style.borderRadius = 'var(--radius)';
                card.style.padding = '1.5rem';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                card.style.backgroundColor = '#fff';

                let html = `
                    <h3 style="color: var(--color-primary-dark); margin-top: 0; margin-bottom: 0.5rem;">${analysis.type}</h3>
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

            // Show export buttons if there are reports
            const exportDiv = document.querySelector('div[style*="display: none"]');
            if (exportDiv) {
                exportDiv.style.display = 'flex';
            }
        }
    } catch(e) { console.error(e); }
});
