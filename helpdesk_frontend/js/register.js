document.addEventListener('DOMContentLoaded', () => {
    
    
    
    const registerForm = document.getElementById('register-form');
    const submitButton = document.getElementById('submit-btn');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';

        
        showMessage('error-box', '', 'success'); 

        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const first_name = document.getElementById('first_name').value; 
        const last_name = document.getElementById('last_name').value;   

        
        const data = {
            username: username,
            password: password,
            email: email,
            first_name: first_name, 
            last_name: last_name    
        };

        try {
            
            const response = await fetch(`${API_BASE_URL}/api/register/`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                
                showMessage('error-box', 'Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    
                    window.location.href = 'index.html'; 
                }, 2000);
            } else {
                throw new Error(JSON.stringify(result));
            }
        } catch (error) {
            console.error('Register error:', error);
            
            showMessage('error-box', `Error: ${error.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    });
});