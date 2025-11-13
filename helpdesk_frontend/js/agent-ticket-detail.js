// js/agent-ticket-detail.js
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        logout();
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('id');
    if (!ticketId) {
        window.location.href = 'dashboard-agent.html'; 
        return;
    }
    const token = getToken();
    
    // (อ้างอิง Element ทั้งหมด)
    const detailsContainer = document.getElementById('ticket-details');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');
    const commentSubmitBtn = document.getElementById('comment-submit-btn');
    
    // (Element ใหม่ของ Agent)
    const statusSelect = document.getElementById('status-select');
    const updateTicketBtn = document.getElementById('update-ticket-btn');

    // --- (ฟังก์ชันที่ 1: ดึง Ticket) ---
    async function fetchTicketDetails() {
        try {
            // (Agent ดึงข้อมูล Ticket)
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch ticket details');
            const ticket = await response.json();
            renderTicketDetails(ticket); 
        } catch (error) {
            console.error("Fetch Ticket Error:", error);
            detailsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }
    
    // --- (ฟังก์ชันที่ 2: ดึง Comments) ---
    async function fetchComments() {
        try {
            // (Agent ดึง Comments)
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch comments');
            const comments = await response.json();
            renderComments(comments); 
        } catch (error) {
            console.error("Fetch Comments Error:", error);
            commentsList.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }
    
    // --- (ฟังก์ชันที่ 3: วาด Ticket) ---
    function renderTicketDetails(ticket) {
        const lastUpdated = new Date(ticket.updated_at).toLocaleString();
        detailsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1>${ticket.title}</h1>
                <span class="status-tag status-${ticket.status.toLowerCase()}">${ticket.status}</span>
            </div>
            <p><strong>From User:</strong> ${ticket.user.username}</p> 
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><strong>Last Updated:</strong> ${lastUpdated}</p><hr>
            <p>${ticket.description}</p>
        `;
        // (ตั้งค่า Dropdown ให้ตรงกับสถานะปัจจุบัน)
        statusSelect.value = ticket.status; 
        if (ticket.status === 'CLOSED') {
            commentForm.style.display = 'none';
            statusSelect.disabled = true;
            updateTicketBtn.disabled = true;
        }
    }

    // --- (ฟังก์ชันที่ 4: วาด Comments) ---
    function renderComments(comments) {
        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.innerHTML = '<p>No comments yet.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentDate = new Date(comment.created_at).toLocaleString();
            commentsList.innerHTML += `
                <div class="comment-card">
                    <strong>${comment.user.username}</strong> <small>on ${commentDate}</small>
                    <p>${comment.text}</p>
                </div>
            `;
        });
    }

    // --- (ฟังก์ชันที่ 5: "ดัก" การ submit Comment) ---
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        const text = commentText.value;
        if (!text) return; 
        
        // ‼️ (สำคัญ) เช็ก API doc ว่า Key ชื่อ 'ticket' หรือ 'ticket_id'
        const data = { text: text, ticket: ticketId }; 
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                commentText.value = ''; 
                fetchComments(); // โหลด Comment ใหม่อย่างเดียว
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }
        } catch (error) {
            console.error("Comment Post Error:", error);
            showMessage('comment-message', `Error: ${error.message}`, 'error');
        } finally {
            commentSubmitBtn.disabled = false;
        }
    });

    // --- (ฟังก์ชันที่ 6: "ดัก" การอัปเดตสถานะของ Agent) ---
    updateTicketBtn.addEventListener('click', async () => {
        const newStatus = statusSelect.value;
        // (ส่ง "เฉพาะ" สิ่งที่เปลี่ยน)
        const data = { status: newStatus };

        try {
            // ‼️ Endpoint นี้คือการ "อัปเดต" (PATCH) Ticket
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/`, {
                method: 'PATCH', // 👈 (สำคัญ)
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showMessage('update-message', 'Ticket updated successfully!', 'success');
                fetchTicketDetails(); // โหลดข้อมูล Ticket ใหม่อีกครั้ง (เพื่ออัปเดตหน้าจอ)
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }

        } catch (error) {
            console.error("Update Ticket Error:", error);
            showMessage('update-message', `Error: ${error.message}`, 'error');
        }
    });

    // --- (เริ่มทำงาน!) ---
    fetchTicketDetails();
    fetchComments();
});