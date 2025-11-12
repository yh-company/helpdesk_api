// js/dashboard-agent.js

document.addEventListener('DOMContentLoaded', () => {

    if (!isAuthenticated()) {
        logout();
        return;
    }
    
    // (เราต้องมั่นใจว่า Agent ล็อกอินด้วย Token ที่มีสิทธิ์ 'is_staff')
    const token = getToken();
    const ticketListContainer = document.getElementById('ticket-list'); // ‼️ HTML ต้องมี <div id="ticket-list">

    async function fetchAllTickets() {
        try {
            // ‼️ Endpoint นี้ต้อง "ดึง Ticket ทั้งหมด" (สำหรับ Agent)
            // (อาจจะเป็น /api/tickets/ หรือ /api/all-tickets/ ก็ได้)
            const response = await fetch(`${API_BASE_URL}/api/tickets/`, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) logout(); // ไม่มีสิทธิ์
                throw new Error('Failed to fetch ticket queue');
            }
            const tickets = await response.json();
            renderAgentTickets(tickets); 

        } catch (error) {
            console.error('Error fetching tickets:', error);
            ticketListContainer.innerHTML = '<p style="text-align: center; color: red;">Could not connect to the server.</p>';
        }
    }

    function renderAgentTickets(tickets) {
        ticketListContainer.innerHTML = ''; 
        if (tickets.length === 0) {
            ticketListContainer.innerHTML = '<p style="text-align: center;">There are no tickets in the queue.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const lastUpdated = new Date(ticket.updated_at).toLocaleString();
            
            const cardLink = document.createElement('a');
            // ‼️ (ขั้นตอนต่อไป) เราต้องสร้าง 'agent-ticket-detail.html'
            cardLink.href = `agent-ticket-detail.html?id=${ticket.id}`; 
            cardLink.className = 'card-link';

            // ‼️ ตรวจสอบชื่อ Field (ticket.user.username) ให้ตรงกับ API
            cardLink.innerHTML = `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${ticket.title}</h3> 
                        <span class="status-tag status-${ticket.status.toLowerCase()}">
                            ${ticket.status}
                        </span>
                    </div>
                    <p><strong>From User:</strong> ${ticket.user.username}</p> 
                    <small>
                        Priority: ${ticket.priority} • Last updated: ${lastUpdated}
                    </small>
                </div>
            `;
            ticketListContainer.appendChild(cardLink);
        });
    }

    // (ปุ่ม Logout)
    document.getElementById('logout-btn').addEventListener('click', () => { // ‼️ HTML ต้องมี <button id="logout-btn">
        logout(); 
    });

    // เริ่มทำงาน!
    fetchAllTickets();
});