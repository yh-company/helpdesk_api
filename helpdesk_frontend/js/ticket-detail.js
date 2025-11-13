// js/ticket-detail.js
// ‼️ (เวอร์ชันแก้ไขสมบูรณ์ - แก้ไข Key 'user' ที่ไม่ตรงกัน) ‼️

document.addEventListener('DOMContentLoaded', () => {

    if (!isAuthenticated()) {
        logout();
        return;
    }

    // 1. ดึง "id" ของ Ticket ออกมาจาก URL (เช่น ...?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('id');

    if (!ticketId) {
        window.location.href = 'mytickets.html'; 
        return;
    }

    const token = getToken();
    const detailsContainer = document.getElementById('ticket-details'); 
    const commentsList = document.getElementById('comments-list'); 
    const commentForm = document.getElementById('comment-form'); 
    const commentText = document.getElementById('comment-text'); 
    const commentSubmitBtn = document.getElementById('comment-submit-btn');
    const commentMessage = document.getElementById('comment-message'); 

    // 2. ฟังก์ชันสำหรับดึงข้อมูล "Ticket"
    async function fetchTicketDetails() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch ticket details');
            const ticket = await response.json();
            renderTicketDetails(ticket);
        } catch (error) {
            console.error('Error:', error);
            detailsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    // 3. ฟังก์ชันสำหรับดึง "Comments"
    async function fetchComments() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, { 
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
            if (!response.ok) throw new Error('Failed to fetch comments');
            
            // ✅ (ถูกต้อง) แก้ไขเรื่อง Pagination .results แล้ว
            const responseData = await response.json();
            renderComments(responseData.results); 
        } catch (error) {
            console.error('Error fetching comments:', error);
            commentsList.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    // --- (ฟังก์ชัน renderTicketDetails) ---
    function renderTicketDetails(ticket) {
        if (!detailsContainer) return;
        
        const created = new Date(ticket.created_at).toLocaleString();
        const updated = new Date(ticket.updated_at).toLocaleString();

        // ⭐️ --- (จุดที่แก้ไข 1) --- ⭐️
        // API ส่ง 'user' (ที่เป็น Object) ไม่ใช่ 'created_by_username' (ที่เป็น String)
        const username = ticket.user ? ticket.user.username : 'Unknown';
        // ⭐️ --- (สิ้นสุดจุดที่แก้ไข) --- ⭐️

        detailsContainer.innerHTML = `
            <h3>${ticket.title}</h3>
            <span class="status-tag status-${ticket.status ? ticket.status.toLowerCase() : 'unknown'}">
                ${ticket.status || 'N/A'}
            </span>
            <p><strong>Priority:</strong> ${ticket.priority || 'N/A'}</p>
            <p><strong>Description:</strong></p>
            <p>${ticket.description || 'No description provided.'}</p>
            <hr>
            <small>Created by: ${username} at ${created}</small><br>
            <small>Last updated: ${updated}</small>
        `;

        // (ถ้า Ticket ปิดไปแล้ว User ก็ Comment ไม่ได้)
        if (ticket.status === 'CLOSED') {
            commentForm.style.display = 'none';
        }
    }

    // --- (ฟังก์ชัน renderComments) ---
    function renderComments(comments) {
    
    const commentsList = document.getElementById('comments-list'); 
    if (!commentsList) return; 

    commentsList.innerHTML = ''; 
    
   
    if (!Array.isArray(comments) || comments.length === 0) { 
        commentsList.innerHTML = '<p>No comments yet.</p>';
        return;
    }

    comments.forEach(comment => {
        const commentDate = new Date(comment.created_at).toLocaleString();
        
      
        const usernameDisplay = comment.user || 'Unknown User'; 
        
        
        const commentBody = comment.body || 'No text provided.'; 
        
        commentsList.innerHTML += `
            <div class="comment-card">
                <strong>${usernameDisplay}</strong> <small>on ${commentDate}</small> 
                
                <p>${commentBody}</p> 
            </div>
        `;
    });
}
    // 4. "ดัก" การ submit Comment ใหม่
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        
        const text = commentText.value;
        if (!text) {
            commentSubmitBtn.disabled = false;
            return;
        }

        // ✅ (ถูกต้อง) ใช้ 'body: text' แล้ว
        const data = {
            body: text, 
            ticket: ticketId 
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                commentText.value = ''; // ล้างช่องพิมพ์
                fetchComments(); // โหลด Comment ใหม่อย่างเดียว
                if (commentMessage) commentMessage.innerHTML = ''; // ล้าง error
            } else {
                const err = await response.json();
                const errorText = Object.values(err).join(' '); 
                throw new Error(errorText);
            }
        } catch (error) {
            if (commentMessage) {
                commentMessage.innerHTML = `<span style="color: red;">${error.message}</span>`;
            }
        } finally {
            commentSubmitBtn.disabled = false;
        }
    });

    // 5. เริ่มทำงาน!
    fetchTicketDetails();
    fetchComments();
});