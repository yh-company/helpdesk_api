document.addEventListener('DOMContentLoaded', () => {
    
   
    if (isAuthenticated()) {
        const token = getToken();
        
        
        const decoded = decodeToken(token);
        
        
        if (decoded && decoded.is_staff) {
            
            console.log("Redirecting existing session to Agent Dashboard.");
            window.location.href = 'dashboard-agent.html';
        } else {
            
            console.log("Redirecting existing session to User Dashboard.");
            window.location.href = 'mytickets.html';
        }
        return; 
    }
    


    
    const loginForm = document.getElementById('login-form'); 
    const submitButton = document.getElementById('submit-btn'); 

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        showMessage('form-message', '', 'success'); 

        const username = document.getElementById('username').value; 
        const password = document.getElementById('password').value; 

        try {
            
            const response = await fetch(`${API_BASE_URL}/api/token/`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username, 
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                
                saveToken(data.access); 
                
                
                const decoded = decodeToken(data.access);
                
                
                console.log("New Token Decoded:", decoded); 
                
                
                if (decoded && decoded.is_staff) {
                    
                    window.location.href = 'dashboard-agent.html';
                } else {
                    
                    window.location.href = 'mytickets.html';
                }
            } else {
                throw new Error(data.detail || 'Failed to login');
            }

        } catch (error) {
            console.error('Login error:', error);
            showMessage('form-message', `Error: ${error.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
});