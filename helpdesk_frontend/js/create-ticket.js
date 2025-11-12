// js/create-ticket.js

document.addEventListener('DOMContentLoaded', () => {

    // (ฟังก์ชันจาก api.js) ถ้ายังไม่ล็อกอิน ให้เด้งกลับไป
    if (!isAuthenticated()) {
        logout();
        return;
    }
    
    const ticketForm = document.getElementById('create-ticket-form'); // ‼️ HTML ต้องมี <form id="create-ticket-form">
    const submitButton = document.getElementById('submit-btn');
    const token = getToken(); // (ฟังก์ชันจาก api.js)

    ticketForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        showMessage('form-message', '', 'success'); // ‼️ HTML ต้องมี <div id="form-message">

        // ‼️ รวบรวมข้อมูลจากฟอร์ม
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;

        // ‼️ ตรวจสอบชื่อ Key (title, description) ให้ตรงกับ Serializer
        const data = {
            title: title,
            description: description,
            priority: priority
        };

        try {
            // (API_BASE_URL มาจาก api.js)
            // ‼️ Endpoint นี้ต้องตรงกับ API สร้าง Ticket
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
                    // ‼️ แก้ชื่อไฟล์ ถ้าหน้า List ของคุณคือ 'dashboard-user.html'
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