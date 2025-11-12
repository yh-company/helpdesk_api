// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // (ฟังก์ชันจาก api.js) ถ้าล็อกอินอยู่แล้ว ให้เด้งไปหน้า My Tickets เลย
    if (isAuthenticated()) {
        // ‼️ แก้ชื่อไฟล์ ถ้าหน้า List ของคุณคือ 'dashboard-user.html'
        window.location.href = 'mytickets.html';
        return;
    }

    const loginForm = document.getElementById('login-form'); // ‼️ HTML ต้องมี <form id="login-form">
    const submitButton = document.getElementById('submit-btn'); // ‼️ HTML ต้องมี <button id="submit-btn">

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        showMessage('form-message', '', 'success'); // ‼️ HTML ต้องมี <div id="form-message">

        const username = document.getElementById('username').value; // ‼️ HTML ต้องมี <input id="username">
        const password = document.getElementById('password').value; // ‼️ HTML ต้องมี <input id="password">

        try {
            // (API_BASE_URL มาจากไฟล์ api.js)
            // ‼️ Endpoint นี้ต้องตรงกับ Django simple-jwt
            const response = await fetch(`${API_BASE_URL}/api/token/`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username, // ‼️ ถ้า API รับ email ให้แก้ key นี้เป็น 'email'
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ สำเร็จ! บันทึก Token (ใช้ฟังก์ชันจาก api.js)
                saveToken(data.access); 
                
                // เด้งไปหน้า My Tickets
                // ‼️ แก้ชื่อไฟล์ ถ้าหน้า List ของคุณคือ 'dashboard-user.html'
                window.location.href = 'mytickets.html';
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