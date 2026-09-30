document.addEventListener('DOMContentLoaded', function() {
    var toggleBtn = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');
    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    var copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        var currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = '☀️ Light Mode';
        } else {
            themeToggle.textContent = '🌙 Dark Mode';
        }
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '☀️ Light Mode';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌙 Dark Mode';
            }
        });
    }


    var sliderImages = document.querySelectorAll('.slider-image');
    if (sliderImages.length > 0) {
        var currentSlide = 0;
        setInterval(function() {
            sliderImages[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % sliderImages.length;
            sliderImages[currentSlide].classList.add('active');
        }, 3500);
    }



    var farmInput = document.getElementById('farm-size');
    var liveCalc = document.getElementById('live-calc');
    if (farmInput && liveCalc) {
        farmInput.addEventListener('input', function() {
            var val = parseFloat(farmInput.value);
            if (!isNaN(val) && val > 0) {
                liveCalc.textContent = 'Live Estimate: No Data Available Yet.';
            } else {
                liveCalc.textContent = '';
            }
        });
    }

    var form = document.getElementById('analysis-form');
    var successModal = document.getElementById('success-modal');
    var successModalTitle = document.getElementById('success-modal-title');
    var successModalBody = document.getElementById('success-modal-body');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var sizeVal = farmInput.value.trim();
            var soilVal = document.getElementById('soil-type').value;
            var waterVal = document.getElementById('water-source').value;

            if (sizeVal === '') {
                alert('Validation Error: Farm Size is required.');
                return;
            }
            var farmSize = parseFloat(sizeVal);
            if (isNaN(farmSize) || farmSize <= 0) {
                alert('Validation Error: Farm Size must be a positive number.');
                return;
            }
            if (soilVal === '') {
                alert('Validation Error: Please select a Soil Type.');
                return;
            }
            if (waterVal === '') {
                alert('Validation Error: Please select a Water Source.');
                return;
            }

            var step1 = document.getElementById('step-1');
            var step2 = document.getElementById('step-2');
            var step3 = document.getElementById('step-3');

            if (step1 && step2) {
                step1.classList.remove('active');
                step2.classList.add('active');
            }

            var resultContainer = document.getElementById('result-container');
            resultContainer.style.display = 'block';
            resultContainer.style.color = 'var(--color-primary)';
            resultContainer.style.backgroundColor = 'var(--color-bg)';
            resultContainer.style.border = '2px dashed var(--color-border)';
            resultContainer.style.padding = '1.25rem';
            resultContainer.style.borderRadius = 'var(--radius)';
            resultContainer.style.fontWeight = '600';
            resultContainer.style.textAlign = 'center';

            var phase = 1;
            resultContainer.textContent = '⏳ Analyzing soil metrics...';

            var interval = setInterval(function() {
                phase++;
                if (phase === 2) {
                    resultContainer.textContent = '⏳ Loading crop recommendations...';
                } else if (phase === 3) {
                    resultContainer.textContent = '⏳ Completed soil analysis.';
                } else if (phase === 4) {
                    clearInterval(interval);
                    resultContainer.style.display = 'none';
                    resultContainer.textContent = '';
                    showResults();
                }
            }, 500);

            function showResults() {
                var crop = '';
                var waterNeed = '';

                if (soilVal === 'black' && waterVal === 'canal') {
                    crop = 'Cotton / Sugarcane';
                    waterNeed = 'High';
                } else if (soilVal === 'sandy' && waterVal === 'rain') {
                    crop = 'Millet / Sorghum';
                    waterNeed = 'Low';
                } else if (soilVal === 'alluvial' && waterVal === 'tubewell') {
                    crop = 'Wheat / Rice';
                    waterNeed = 'Medium';
                } else {
                    crop = 'Maize / Soybean';
                    waterNeed = 'Medium';
                }

                var bags = farmSize * 2;

                var acresEl = document.getElementById('stat-acres-val');
                var soilEl = document.getElementById('stat-soil-val');
                var seedsEl = document.getElementById('stat-seeds-val');

                if (acresEl) acresEl.textContent = farmSize + ' Acres';
                if (soilEl) {
                    var soilSelect = document.getElementById('soil-type');
                    soilEl.textContent = soilSelect.options[soilSelect.selectedIndex].text;
                }
                if (seedsEl) seedsEl.textContent = bags + ' Bags';

                document.querySelectorAll('.stat-caption').forEach(function(cap) {
                    cap.textContent = 'Current user data';
                });

                if (step2 && step3) {
                    step2.classList.remove('active');
                    step3.classList.add('active');
                }

                if (successModal && successModalTitle && successModalBody) {
                    successModalTitle.innerHTML = '<span class="modal-header-icon">🌾</span> Analysis Completed!';
                    successModalBody.innerHTML = '<p style="font-size: 1.1rem; margin-bottom: 1rem;">Here is the suggested strategy for your farm:</p>' +
                        '<ul style="font-size: 1.1rem; text-align: left; background: #f8f9fa; padding: 1.5rem 1.5rem 1.5rem 2.5rem; border-radius: 8px;">' +
                        '<li style="margin-bottom: 0.5rem;"><strong>Recommended Crop:</strong> ' + crop + '</li>' +
                        '<li style="margin-bottom: 0.5rem;"><strong>Estimated Seed Bags:</strong> ' + bags + '</li>' +
                        '<li><strong>Water Need:</strong> ' + waterNeed + '</li>' +
                        '</ul>';
                        
                    // Save analysis to PostgreSQL database via API
                    fetch('/api/analysis/save', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            type: 'Field & Soil Metrics',
                            inputs: { 'farm_size': farmSize, 'soil': soilVal, 'water': waterVal },
                            results: { 'recommended_crop': crop, 'seed_bags': bags, 'water_need': waterNeed }
                        })
                    }).catch(err => console.error(err));
                    
                    // Hook into modal close to reload page and reflect latest analysis immediately
                    const closeBtns = successModal.querySelectorAll('.close-modal');
                    closeBtns.forEach(btn => {
                        btn.addEventListener('click', function reloadAfterClose() {
                            window.location.reload();
                        });
                    });
                    successModal.classList.add('active');
                    document.body.classList.add('modal-open');
                }
            }
        });
    }

    document.querySelectorAll('.close-modal').forEach(function(el) {
        el.addEventListener('click', function() {
            var openModal = el.closest('.modal-overlay');
            if (openModal) {
                openModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });
});
