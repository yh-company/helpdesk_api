

document.addEventListener('DOMContentLoaded', () => {

    
    if (!isAuthenticated()) {
        logout();
        return;
    }
    
    const ticketForm = document.getElementById('create-ticket-form'); 
    const submitButton = document.getElementById('submit-btn');
    const token = getToken(); 

    ticketForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        showMessage('form-message', '', 'success'); 

       
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;

        
        const data = {
            title: title,
            description: description,
            priority: priority
        };

        try {
           
            const response = await fetch(`${API_BASE_URL}/api/tickets/`, { 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            });

            if (response.ok) { 
                showMessage('form-message', 'Ticket created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    
                    window.location.href = 'mytickets.html'; 
                }, 2000);
            } else {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

        } catch (error) {
            console.error('Error creating ticket:', error);
            showMessage('form-message', `Error: ${error.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Ticket';
        }
    });
});