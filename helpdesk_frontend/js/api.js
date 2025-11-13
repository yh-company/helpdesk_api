const API_BASE_URL = "http://127.0.0.1:8000"; 

/**
 
 * @param {string} token 
    */
function saveToken(token) {
    localStorage.setItem('token', token);
}

/**
 
 * @returns {string|null} 
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * 
 * @returns {boolean}
 */
function isAuthenticated() {
    return !!getToken(); 
}

function decodeToken(token) {
    try {
        
        const base64Url = token.split('.')[1]; 
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
        
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token:", e);
        return null; 
    }
}



function logout() {
    localStorage.removeItem('token');
   
    window.location.href = 'index.html'; 
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

