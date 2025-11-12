// js/register.js

document.addEventListener('DOMContentLoaded', () => {
    
    const registerForm = document.getElementById('register-form'); // ‼️ HTML ต้องมี <form id="register-form">
    const submitButton = document.getElementById('submit-btn'); // ‼️ HTML ต้องมี <button id="submit-btn">

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';
        showMessage('form-message', '', 'success'); // ‼️ HTML ต้องมี <div id="form-message">

        // ‼️ รวบรวมข้อมูลทั้งหมดจากฟอร์มของคุณ (เช่น username, email, password)
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        // (เพิ่ม first_name, last_name ถ้ามี)

        // ‼️ สร้าง 'data' object ให้ตรงกับ API Serializer ของคุณ
        const data = {
            username: username,
            password: password,
            email: email
        };

        try {
            // (API_BASE_URL มาจาก api.js)
            // ‼️ Endpoint นี้ต้องตรงกับ API สร้าง User ของคุณ
            const response = await fetch(`${API_BASE_URL}/api/register/`, { // 👈 ‼️ แก้ไข Endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('form-message', 'Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    // ‼️ แก้ชื่อไฟล์ ถ้าหน้าล็อกอินของคุณคือ 'index.html'
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                throw new Error(JSON.stringify(result));
            }
        } catch (error) {
            console.error('Register error:', error);
            showMessage('form-message', `Error: ${error.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    });
});