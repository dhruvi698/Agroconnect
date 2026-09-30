document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const mobileInput = document.getElementById('login-mobile');
    const passInput = document.getElementById('login-pass');
    const mobileErr = document.getElementById('login-err-mobile');
    const passErr = document.getElementById('login-err-pass');
    const togglePass = document.getElementById('login-toggle-pass');
    const submitBtn = document.getElementById('login-submit');

    // Toggle Password Visibility
    if (togglePass) {
        togglePass.addEventListener('click', () => {
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            togglePass.textContent = type === 'password' ? '👁' : '👁‍🗨';
        });
    }

    const validateMobile = () => {
        const isValid = /^[0-9]{10}$/.test(mobileInput.value.trim());
        mobileErr.style.display = isValid ? 'none' : 'block';
        return isValid;
    };

    const validatePass = () => {
        const isValid = passInput.value.trim().length > 0;
        passErr.style.display = isValid ? 'none' : 'block';
        return isValid;
    };

    const validateForm = () => {
        const isMobileValid = /^[0-9]{10}$/.test(mobileInput.value.trim());
        const isPassValid = passInput.value.trim().length > 0;
        
        if (isMobileValid && isPassValid) {
            submitBtn.removeAttribute('disabled');
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.setAttribute('disabled', 'true');
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        }
    };

    mobileInput.addEventListener('input', () => {
        validateMobile();
        validateForm();
    });
    
    passInput.addEventListener('input', () => {
        validatePass();
        validateForm();
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateMobile() || !validatePass()) return;

        const payload = {
            mobile: mobileInput.value.trim(),
            password: passInput.value
        };

        submitBtn.innerHTML = 'Logging in...';
        submitBtn.setAttribute('disabled', 'true');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                window.location.href = '/dashboard';
            } else {
                alert(data.message || 'Login failed.');
                submitBtn.innerHTML = 'Login';
                submitBtn.removeAttribute('disabled');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred. Please try again.');
            submitBtn.innerHTML = 'Login';
            submitBtn.removeAttribute('disabled');
        }
    });
});
