
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        logout();
        return;
    }
    const token = getToken();
    const ticketListContainer = document.getElementById('ticket-list');

    async function fetchAllTickets() {
        try {
            
            
            
            const response = await fetch(`${API_BASE_URL}/api/tickets/`, { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) logout(); 
                throw new Error('Failed to fetch ticket queue');
            }
            const data = await response.json();
            renderAgentTickets(data.results); 
        } catch (error) {
            console.error('Error fetching tickets:', error);
            ticketListContainer.innerHTML = '<p style="color: red;">Could not connect to the server.</p>';
        }
    }

    function renderAgentTickets(tickets) {
        ticketListContainer.innerHTML = ''; 
        if (tickets.length === 0) {
            ticketListContainer.innerHTML = '<p style="text-align: center;">No tickets in queue.</p>';
            return;
        }
        tickets.forEach(ticket => {
            const lastUpdated = new Date(ticket.updated_at).toLocaleString();
            const cardLink = document.createElement('a');
            
            cardLink.href = `agent-ticket-detail.html?id=${ticket.id}`; 
            cardLink.className = 'card-link';

            
            cardLink.innerHTML = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${ticket.title}</h3> 
                        <span class="status-tag status-${ticket.status.toLowerCase()}">${ticket.status}</span>
                    </div>
                    <p><strong>From User:</strong> ${ticket.user.username}</p> 
                    <small>Priority: ${ticket.priority} • Last updated: ${lastUpdated}</small>
                </div>
            `;
            ticketListContainer.appendChild(cardLink);
        });
    }
    document.getElementById('logout-btn').addEventListener('click', () => {
        logout(); 
    });
    fetchAllTickets();
});