// js/register.js
// (เวอร์ชันแก้ไขสมบูรณ์: 1. แก้ ID กล่อง Error, 2. เพิ่ม first/last name, 3. แก้ redirect)

document.addEventListener('DOMContentLoaded', () => {
    
    // (ดึงฟังก์ชันมาจาก api.js)
    
    const registerForm = document.getElementById('register-form');
    const submitButton = document.getElementById('submit-btn');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';

        // ✅ (FIX 1) แก้ ID ให้ตรงกับ HTML (id="error-box")
        showMessage('error-box', '', 'success'); 

        // ✅ (FIX 2) รวบรวมข้อมูล "ทั้งหมด" จากฟอร์ม
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const first_name = document.getElementById('first_name').value; // 👈 (เพิ่ม)
        const last_name = document.getElementById('last_name').value;   // 👈 (เพิ่ม)

        // ✅ (FIX 2) สร้าง 'data' object ให้ครบ
        const data = {
            username: username,
            password: password,
            email: email,
            first_name: first_name, // 👈 (เพิ่ม)
            last_name: last_name    // 👈 (เพิ่ม)
        };

        try {
            // (API_BASE_URL มาจาก api.js)
            // ‼️ Endpoint นี้ต้องตรงกับ API สร้าง User ของคุณ (ผมเดาว่า /api/users/register/)
            const response = await fetch(`${API_BASE_URL}/api/register/`, { // 👈 ‼️ แก้ไข Endpoint ถ้าจำเป็น
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // ✅ (FIX 1) แก้ ID ให้ตรงกับ HTML
                showMessage('error-box', 'Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    // ✅ (FIX 3) แก้ redirect ให้ไป 'index.html'
                    window.location.href = 'index.html'; 
                }, 2000);
            } else {
                throw new Error(JSON.stringify(result));
            }
        } catch (error) {
            console.error('Register error:', error);
            // ✅ (FIX 1) แก้ ID ให้ตรงกับ HTML
            showMessage('error-box', `Error: ${error.message}`, 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    });
});