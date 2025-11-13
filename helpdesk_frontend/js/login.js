// js/login.js
// ‼️ (เวอร์ชันแก้ไข - แก้ไข "ยาม" (Guard) ที่ด้านบน) ‼️

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ⭐️ (โค้ด "ยาม" ที่ต้องแก้ไข) ⭐️ ---
    if (isAuthenticated()) {
        const token = getToken();
        
        // 1. ถอดรหัส Token เพื่อเช็ก Role (เรียกฟังก์ชันจาก api.js)
        const decoded = decodeToken(token);
        
        // 2. ตรวจสอบ Role และ Redirect
        if (decoded && decoded.is_staff) {
            // ✅ ถ้าเป็น Agent
            console.log("Redirecting existing session to Agent Dashboard.");
            window.location.href = 'dashboard-agent.html';
        } else {
            // ✅ ถ้าเป็น User
            console.log("Redirecting existing session to User Dashboard.");
            window.location.href = 'mytickets.html';
        }
        return; // หยุดทำงาน
    }
    // --- ⭐️ (สิ้นสุดจุดที่แก้ไข) ⭐️ ---


    // (โค้ดส่วนที่เหลือของคุณถูกต้อง 100% แล้ว)
    const loginForm = document.getElementById('login-form'); 
    const submitButton = document.getElementById('submit-btn'); 

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        showMessage('form-message', '', 'success'); 

        const username = document.getElementById('username').value; 
        const password = document.getElementById('password').value; 

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
                // 1. บันทึก Token (เหมือนเดิม)
                saveToken(data.access); 
                
                // 2. ถอดรหัส Token (เหมือนเดิม)
                const decoded = decodeToken(data.access);
                
                // (แนะนำ: เพิ่ม log นี้ไว้เช็กตอนล็อกอินใหม่)
                console.log("New Token Decoded:", decoded); 
                
                // 3. ตรวจสอบ Role (เหมือนเดิม)
                if (decoded && decoded.is_staff) {
                    // Agent: ไปหน้า Agent Dashboard
                    window.location.href = 'dashboard-agent.html';
                } else {
                    //  User ธรรมดา: ไปหน้า My Tickets
                    window.location.href = 'mytickets.html';
                }
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