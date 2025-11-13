// js/agent-ticket-detail.js
// ‼️ เวอร์ชันสมบูรณ์: แก้ไข POST/PATCH ให้ตรงกับ Backend Serializer (body, status) ‼️

document.addEventListener('DOMContentLoaded', () => {
    // 1. ตรวจสอบการล็อกอิน
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
    const commentMessage = document.getElementById('comment-message'); // 👈 เพิ่มไว้แสดง Error/Success
    
    // (Element ของ Agent)
    const statusSelect = document.getElementById('status-select');
    const updateTicketBtn = document.getElementById('update-ticket-btn');
    const updateMessage = document.getElementById('update-message'); // 👈 เพิ่มไว้แสดง Error/Success

    // Helper function สำหรับแสดงข้อความ Error/Success
    function showAgentMessage(element, message, type = 'error') {
        if (element) {
            element.innerHTML = `<span style="color: ${type === 'error' ? 'red' : 'green'};">${message}</span>`;
        }
    }

    // --- (ฟังก์ชันที่ 1: ดึง Ticket) ---
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
            detailsContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }
    
    // --- (ฟังก์ชันที่ 2: ดึง Comments) ---
    async function fetchComments() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch comments');

            // ✅ (ถูกต้อง) แก้ไข Pagination .results แล้ว
            const data = await response.json();
            renderComments(data.results); 

        } catch (error) {
            commentsList.innerHTML = `<p style="color: red;">Error fetching comments.</p>`;
        }
    }
    
    // --- (ฟังก์ชันที่ 3: วาด Ticket) ---
    function renderTicketDetails(ticket) {
        const lastUpdated = new Date(ticket.updated_at).toLocaleString();
        
        // ‼️ (สำคัญ) เนื่องจาก Serializer ใช้ StringRelatedField: created_by จะเป็นชื่อ User (String) 
        // ไม่ใช่ Object ที่มี .username
        const createdByUser = ticket.created_by || 'N/A'; 

        detailsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1>${ticket.title}</h1>
                <span class="status-tag status-${ticket.status.toLowerCase()}">${ticket.status}</span>
            </div>
            
            <p><strong>From User:</strong> ${createdByUser}</p> 
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
        } else {
             commentForm.style.display = 'block'; // แสดงฟอร์ม Comment
             statusSelect.disabled = false;
             updateTicketBtn.disabled = false;
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
            
            // ‼️ (สำคัญ) เนื่องจาก Serializer ใช้ StringRelatedField: user จะเป็นชื่อ User (String)
            const commentUser = comment.user || 'Unknown Agent/User';
            
            commentsList.innerHTML += `
                <div class="comment-card">
                    <strong>${commentUser}</strong> <small>on ${commentDate}</small>
                    <p>${comment.body}</p> 
                </div>
            `;
        });
    }

    // --- (ฟังก์ชันที่ 5: "ดัก" การ submit Comment) ---
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        commentMessage.textContent = ''; // ล้างข้อความเก่า
        
        const text = commentText.value;
        if (!text) {
             commentSubmitBtn.disabled = false; 
             return; 
        }
        
        // ✅ (FIXED) ส่ง Key 'body' (ตาม Comment Serializer)
        const data = { body: text, ticket: ticketId }; 
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                commentText.value = ''; 
                fetchComments(); // โหลด Comment ใหม่อย่างเดียว
                showAgentMessage(commentMessage, 'Reply posted!', 'success');
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }
        } catch (error) {
            console.error("Comment Post Error:", error);
            showAgentMessage(commentMessage, `Error posting comment: ${error.message}`, 'error');
        } finally {
            commentSubmitBtn.disabled = false;
        }
    });

    // --- (ฟังก์ชันที่ 6: "ดัก" การอัปเดตสถานะของ Agent) ---
    updateTicketBtn.addEventListener('click', async () => {
        const newStatus = statusSelect.value;
        const data = { status: newStatus };
        updateTicketBtn.disabled = true;
        updateMessage.textContent = ''; // ล้างข้อความเก่า

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
                showAgentMessage(updateMessage, 'Ticket updated successfully!', 'success');
                fetchTicketDetails(); // โหลดข้อมูล Ticket ใหม่อีกครั้ง
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }

        } catch (error) {
            console.error("Update Ticket Error:", error);
            showAgentMessage(updateMessage, `Error updating status: ${error.message}`, 'error');
        } finally {
            updateTicketBtn.disabled = false;
        }
    });

    // --- (เริ่มทำงาน!) ---
    fetchTicketDetails();
    fetchComments();
});