document.addEventListener('DOMContentLoaded', () => {

    if (!isAuthenticated()) {
        logout();
        return;
    }

    
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

    
    async function fetchComments() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, { 
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
            if (!response.ok) throw new Error('Failed to fetch comments');
            
            
            const responseData = await response.json();
            renderComments(responseData.results); 
        } catch (error) {
            console.error('Error fetching comments:', error);
            commentsList.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }

    
    function renderTicketDetails(ticket) {
        if (!detailsContainer) return;
        
        const created = new Date(ticket.created_at).toLocaleString();
        const updated = new Date(ticket.updated_at).toLocaleString();

        
        const username = ticket.user ? ticket.user.username : 'Unknown';
        

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

        
        if (ticket.status === 'CLOSED') {
            commentForm.style.display = 'none';
        }
    }

    
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
    
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        
        const text = commentText.value;
        if (!text) {
            commentSubmitBtn.disabled = false;
            return;
        }

        
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
                commentText.value = ''; 
                fetchComments(); 
                if (commentMessage) commentMessage.innerHTML = ''; 
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

    
    fetchTicketDetails();
    fetchComments();
});