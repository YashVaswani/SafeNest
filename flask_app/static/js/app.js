// SafeNest App JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
    }

    // Auto-dismiss alerts after 4s
    document.querySelectorAll('.alert-dismissible').forEach(alert => {
        setTimeout(() => {
            const btn = alert.querySelector('.btn-close');
            if (btn) btn.click();
        }, 4000);
    });

    // Initialize charts if canvas elements exist
    initCharts();

    // Table search
    const searchInput = document.getElementById('tableSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const term = this.value.toLowerCase();
            document.querySelectorAll('tbody tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    }
});

function initCharts() {
    // Helpers by Type (Doughnut)
    const typeCtx = document.getElementById('helpersByTypeChart');
    if (typeCtx && window.chartDataByType) {
        new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: window.chartDataByType.labels,
                datasets: [{
                    data: window.chartDataByType.values,
                    backgroundColor: ['#6366f1','#ec4899','#3b82f6','#10b981','#f59e0b','#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } }
                },
                cutout: '65%'
            }
        });
    }

    // Entries Trend (Line)
    const entryCtx = document.getElementById('entriesTrendChart');
    if (entryCtx && window.chartDataEntries) {
        new Chart(entryCtx, {
            type: 'line',
            data: {
                labels: window.chartDataEntries.labels,
                datasets: [{
                    label: 'Entries',
                    data: window.chartDataEntries.values,
                    borderColor: '#1a56db',
                    backgroundColor: 'rgba(26,86,219,0.08)',
                    fill: true, tension: 0.4, borderWidth: 2.5,
                    pointBackgroundColor: '#1a56db', pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Rating Distribution (Bar)
    const ratingCtx = document.getElementById('ratingDistChart');
    if (ratingCtx && window.chartDataRatings) {
        new Chart(ratingCtx, {
            type: 'bar',
            data: {
                labels: ['1 Star','2 Stars','3 Stars','4 Stars','5 Stars'],
                datasets: [{
                    data: window.chartDataRatings.values,
                    backgroundColor: ['#ef4444','#f59e0b','#eab308','#22c55e','#10b981'],
                    borderRadius: 6, borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Status Doughnut
    const statusCtx = document.getElementById('helpersByStatusChart');
    if (statusCtx && window.chartDataByStatus) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: window.chartDataByStatus.labels,
                datasets: [{
                    data: window.chartDataByStatus.values,
                    backgroundColor: ['#10b981','#f59e0b','#ef4444','#6b7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position:'bottom', labels: { padding:16, usePointStyle:true } } },
                cutout: '65%'
            }
        });
    }
}
