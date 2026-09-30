document.addEventListener('DOMContentLoaded', async function() {
    const activityCanvas = document.getElementById('activityChart');
    if (!activityCanvas) return;

    try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        
        let reportCounts = {
            'Soil Health': 0,
            'Crop Recommendation': 0,
            'Yield Prediction': 0,
            'Irrigation': 0
        };

        if (data.success) {
            data.reports.forEach(r => {
                if(reportCounts[r.type] !== undefined) {
                    reportCounts[r.type]++;
                }
            });
        }

        const actCtx = activityCanvas.getContext('2d');
        new Chart(actCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(reportCounts),
                datasets: [{
                    label: 'Number of Reports',
                    data: Object.values(reportCounts),
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(241, 196, 15, 0.7)',
                        'rgba(155, 89, 182, 0.7)'
                    ],
                    borderColor: [
                        'rgba(46, 204, 113, 1)',
                        'rgba(52, 152, 219, 1)',
                        'rgba(241, 196, 15, 1)',
                        'rgba(155, 89, 182, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                plugins: { legend: { display: false } }
            }
        });
        
        const distCanvas = document.getElementById('distributionChart');
        if (distCanvas) {
            const distCtx = distCanvas.getContext('2d');
            new Chart(distCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(reportCounts),
                    datasets: [{
                        data: Object.values(reportCounts),
                        backgroundColor: [
                            'rgba(46, 204, 113, 0.8)',
                            'rgba(52, 152, 219, 0.8)',
                            'rgba(241, 196, 15, 0.8)',
                            'rgba(155, 89, 182, 0.8)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
            });
        }
    } catch(e) { console.error(e); }
});
