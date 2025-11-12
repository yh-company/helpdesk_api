// js/ticket-detail.js

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
    const detailsContainer = document.getElementById('ticket-details'); // ‼️ HTML ต้องมี <div id="ticket-details">
    // (ส่วนของ Comment)
    const commentsList = document.getElementById('comments-list'); // ‼️ HTML ต้องมี <div id="comments-list">
    const commentForm = document.getElementById('comment-form'); // ‼️ HTML ต้องมี <form id="comment-form">
    const commentText = document.getElementById('comment-text');
    const commentSubmitBtn = document.getElementById('comment-submit-btn');

    // 2. ฟังก์ชันสำหรับดึงข้อมูล "Ticket"
    async function fetchTicketDetails() {
        try {
            // ‼️ Endpoint นี้ต้องตรงกับ API Detail ของคุณ
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
            // ‼️ Endpoint นี้ต้องตรงกับ API ดึง Comment (แบบ Filter)
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, { // 👈 ‼️ เช็ก Filter 'ticket'
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch comments');
            const comments = await response.json();
            renderComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            commentsList.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    // (ฟังก์ชัน renderTicketDetails และ renderComments... เหมือนเดิม)
    // ... (คัดลอกจากคำตอบก่อนหน้า) ...

    // 4. "ดัก" การ submit Comment ใหม่
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        
        const text = commentText.value;
        if (!text) return; 

        // ‼️ ตรวจสอบ Key (text, ticket) ให้ตรงกับ Serializer
        const data = {
            text: text,
            ticket: ticketId // 👈 ‼️ เช็ก Key 'ticket' หรือ 'ticket_id'
        };

        try {
            // ‼️ Endpoint นี้ต้องตรงกับ API สร้าง Comment
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
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }
        } catch (error) {
            showMessage('comment-message', `Error: ${error.message}`, 'error'); // ‼️ HTML ต้องมี <div id="comment-message">
        } finally {
            commentSubmitBtn.disabled = false;
        }
    });

    // 5. เริ่มทำงาน!
    fetchTicketDetails();
    fetchComments();
});