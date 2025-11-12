// js/api.js

// ‼️‼️‼️ สำคัญมาก: แก้ไข URL นี้ ให้เป็น URL ของ "Backend (Web Service)" ของคุณ
const API_BASE_URL = "https://helpdesk-api-z5q9.onrender.com/"; // 👈 ‼️‼️ แก้ไขตรงนี้

/**
 * บันทึก Token ลงใน localStorage
 * @param {string} token - The JWT access token
 */
function saveToken(token) {
    localStorage.setItem('token', token);
}

/**
 * ดึง Token จาก localStorage
 * @returns {string|null} The JWT access token
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง (มี Token ไหม)
 * @returns {boolean}
 */
function isAuthenticated() {
    return !!getToken(); // (!! คือการแปลง string/null ให้เป็น true/false)
}

/**
 * ล็อกเอาท์ผู้ใช้
 */
function logout() {
    localStorage.removeItem('token');
    // ‼️ แก้ชื่อไฟล์ ถ้าหน้าล็อกอินของคุณคือ 'index.html'
    window.location.href = '/login.html'; 
}

/**
 * Helper function สำหรับแสดงข้อความ Error/Success
 * @param {string} elementId - ID ของ <div> ที่จะแสดงข้อความ
 * @param {string} message - ข้อความที่จะแสดง
 * @param {'error'|'success'} type - ประเภทของข้อความ
 */
function showMessage(elementId, message, type = 'error') {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.style.color = (type === 'error') ? 'red' : 'green';
    }
}