document.addEventListener('DOMContentLoaded', () => {

    
    if (!isAuthenticated()) {
        logout(); 
        return;
    }

    const ticketListContainer = document.getElementById('ticket-list'); 
    const token = getToken(); 

    async function fetchTickets() {
        try {
            
            const response = await fetch(`${API_BASE_URL}/api/tickets/`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) logout(); 
                throw new Error('Failed to fetch tickets');
            }
            
            
            const responseData = await response.json(); 
            renderTickets(responseData.results);      
            

        } catch (error) {
            console.error('Error fetching tickets:', error);
            
            if (ticketListContainer) {
                ticketListContainer.innerHTML = '<p style="text-align: center; color: red;">Could not connect to the server.</p>';
            }
        }
    }

    function renderTickets(tickets) {
        
        if (!ticketListContainer) return; 

        ticketListContainer.innerHTML = ''; 
        if (!tickets || tickets.length === 0) { 
            ticketListContainer.innerHTML = '<p style="text-align: center;">You have not created any tickets yet.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const lastUpdated = new Date(ticket.updated_at).toLocaleString();
            
            
            const cardLink = document.createElement('a');
            cardLink.href = `ticket-detail.html?id=${ticket.id}`; 
            cardLink.className = 'card-link'; 

            
            cardLink.innerHTML = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${ticket.title}</h3> 
                        <span class="status-tag status-${ticket.status ? ticket.status.toLowerCase() : 'unknown'}">
                            ${ticket.status || 'N/A'}
                        </span>
                    </div>
                    <p>${ticket.description || 'No description provided.'}</p> 
                    <small>
                        Priority: ${ticket.priority || 'N/A'} • Last updated: ${lastUpdated}
                    </small>
                </div>
            `;
            ticketListContainer.appendChild(cardLink);
        });
    }

    
    const createBtn = document.getElementById('create-ticket-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => { 
            window.location.href = 'create-ticket.html'; 
        });
    }

    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => { 
            logout(); 
        });
    }

    
    fetchTickets();
});