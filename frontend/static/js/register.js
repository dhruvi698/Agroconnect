document.addEventListener('DOMContentLoaded', function() {
    const regForm = document.getElementById('register-form');
    if (!regForm) return;

    const inputs = {
        name: document.getElementById('reg-name'),
        mobile: document.getElementById('reg-mobile'),
        pass: document.getElementById('reg-pass'),
        confirm: document.getElementById('reg-confirm'),
        village: document.getElementById('reg-village'),
        district: document.getElementById('reg-district'),
        farm: document.getElementById('reg-farm'),
        size: document.getElementById('reg-size'),
        crop: document.getElementById('reg-crop'),
        cropOther: document.getElementById('reg-crop-other')
    };

    const errors = {
        name: document.getElementById('err-name'),
        mobile: document.getElementById('err-mobile'),
        pass: document.getElementById('err-pass'),
        confirm: document.getElementById('err-confirm'),
        village: document.getElementById('err-village'),
        district: document.getElementById('err-district'),
        farm: document.getElementById('err-farm'),
        size: document.getElementById('err-size'),
        crop: document.getElementById('err-crop')
    };

    const strengthContainer = document.getElementById('strength-container');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const togglePass = document.getElementById('toggle-pass');
    const toggleConfirm = document.getElementById('toggle-confirm');
    const submitBtn = document.getElementById('reg-submit');

    // Toggle Password Visibility
    if (togglePass) {
        togglePass.addEventListener('click', () => {
            const type = inputs.pass.getAttribute('type') === 'password' ? 'text' : 'password';
            inputs.pass.setAttribute('type', type);
            togglePass.textContent = type === 'password' ? '👁' : '👁‍🗨';
        });
    }
    if (toggleConfirm) {
        toggleConfirm.addEventListener('click', () => {
            const type = inputs.confirm.getAttribute('type') === 'password' ? 'text' : 'password';
            inputs.confirm.setAttribute('type', type);
            toggleConfirm.textContent = type === 'password' ? '👁' : '👁‍🗨';
        });
    }

    // Crop Logic
    if (inputs.crop) {
        inputs.crop.addEventListener('change', () => {
            if (inputs.crop.value === 'Other') {
                inputs.cropOther.style.display = 'block';
                inputs.cropOther.setAttribute('required', 'true');
            } else {
                inputs.cropOther.style.display = 'none';
                inputs.cropOther.removeAttribute('required');
            }
            validateForm();
        });
    }

    // Validation Functions
    const validators = {
        name: (val) => val.trim().length > 0,
        mobile: (val) => /^[0-9]{10}$/.test(val.trim()),
        pass: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val),
        confirm: (val) => val === inputs.pass.value,
        village: (val) => val.trim().length > 0,
        district: (val) => val.trim().length > 0,
        farm: (val) => val.trim().length > 0,
        size: (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        crop: (val) => {
            if (!val) return false;
            if (val === 'Other') return inputs.cropOther.value.trim().length > 0;
            return true;
        }
    };

    function validateField(field) {
        const isValid = validators[field](inputs[field] ? inputs[field].value : '');
        if (errors[field]) {
            errors[field].style.display = isValid ? 'none' : 'block';
        }
        return isValid;
    }

    function checkPasswordStrength(password) {
        if (!password) {
            strengthContainer.style.display = 'none';
            strengthText.style.display = 'none';
            return;
        }
        strengthContainer.style.display = 'block';
        strengthText.style.display = 'block';
        
        let strength = 0;
        if (password.length > 7) strength += 1;
        if (password.match(/[a-z]+/)) strength += 1;
        if (password.match(/[A-Z]+/)) strength += 1;
        if (password.match(/[0-9]+/)) strength += 1;
        if (password.match(/[@$!%*?&]+/)) strength += 1;
        
        if (strength <= 2) {
            strengthBar.style.width = '33%';
            strengthBar.style.backgroundColor = '#d32f2f';
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#d32f2f';
        } else if (strength <= 4) {
            strengthBar.style.width = '66%';
            strengthBar.style.backgroundColor = '#fbc02d';
            strengthText.textContent = 'Fair';
            strengthText.style.color = '#fbc02d';
        } else {
            strengthBar.style.width = '100%';
            strengthBar.style.backgroundColor = '#2ecc71';
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#2ecc71';
        }
    }

    function validateForm() {
        let isFormValid = true;
        for (const field of Object.keys(validators)) {
            if (!validators[field](inputs[field] ? inputs[field].value : '')) {
                isFormValid = false;
                break;
            }
        }
        
        if (isFormValid) {
            submitBtn.removeAttribute('disabled');
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.setAttribute('disabled', 'true');
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        }
    }

    // Attach Event Listeners
    for (const field of Object.keys(inputs)) {
        if (inputs[field]) {
            inputs[field].addEventListener('input', () => {
                if(field !== 'cropOther') {
                    validateField(field);
                } else {
                    validateField('crop');
                }
                if (field === 'pass') {
                    checkPasswordStrength(inputs.pass.value);
                    if (inputs.confirm.value) validateField('confirm');
                }
                validateForm();
            });
            // Initial blur logic for showing errors only after user interacts
            inputs[field].addEventListener('blur', () => {
                if(field !== 'cropOther') validateField(field);
                else validateField('crop');
            });
        }
    }

    // Submit Logic
    regForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Final sanity check
        let isFormValid = true;
        for (const field of Object.keys(validators)) {
            if (!validateField(field)) isFormValid = false;
        }
        if (!isFormValid) return;

        let finalCrop = inputs.crop.value;
        if (finalCrop === 'Other') {
            finalCrop = inputs.cropOther.value.trim();
        }

        const payload = {
            name: inputs.name.value.trim(),
            mobile: inputs.mobile.value.trim(),
            password: inputs.pass.value,
            village: inputs.village.value.trim(),
            district: inputs.district.value.trim(),
            farm: inputs.farm.value.trim(),
            acres: inputs.size.value.trim(),
            crop: finalCrop
        };

        submitBtn.innerHTML = 'Registering...';
        submitBtn.setAttribute('disabled', 'true');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(data.message);
                window.location.href = '/login';
            } else {
                alert(data.message || 'Registration failed.');
                submitBtn.innerHTML = 'Register';
                submitBtn.removeAttribute('disabled');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred. Please try again.');
            submitBtn.innerHTML = 'Register';
            submitBtn.removeAttribute('disabled');
        }
    });
});
