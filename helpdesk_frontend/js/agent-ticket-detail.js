document.addEventListener('DOMContentLoaded', () => {
    
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
    
    
    const detailsContainer = document.getElementById('ticket-details');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const commentText = document.getElementById('comment-text');
    const commentSubmitBtn = document.getElementById('comment-submit-btn');
    const commentMessage = document.getElementById('comment-message');
    
    
    const statusSelect = document.getElementById('status-select');
    const updateTicketBtn = document.getElementById('update-ticket-btn');
    const updateMessage = document.getElementById('update-message');
    
    
    const deleteTicketBtn = document.getElementById('delete-ticket-btn');
    const deleteMessage = document.getElementById('delete-message');

    
    function showAgentMessage(element, message, type = 'error') {
        if (element) {
            element.innerHTML = `<span style="color: ${type === 'error' ? 'red' : 'green'};">${message}</span>`;
        }
    }

    
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
    
    
    async function fetchComments() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/?ticket=${ticketId}`, { 
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch comments');

            
            const data = await response.json();
            renderComments(data.results); 

        } catch (error) {
            commentsList.innerHTML = `<p style="color: red;">Error fetching comments.</p>`;
        }
    }
    
    
    function renderTicketDetails(ticket) {
        const lastUpdated = new Date(ticket.updated_at).toLocaleString();
        
        
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
       
        statusSelect.value = ticket.status; 
        if (ticket.status === 'CLOSED') {
            commentForm.style.display = 'none';
            statusSelect.disabled = true;
            updateTicketBtn.disabled = true;
            deleteTicketBtn.style.display = 'none'; 
        } else {
             commentForm.style.display = 'block'; 
             statusSelect.disabled = false;
             updateTicketBtn.disabled = false;
             deleteTicketBtn.style.display = 'block';
        }
    }

    
    function renderComments(comments) {
        commentsList.innerHTML = '';
        if (comments.length === 0) {
            commentsList.innerHTML = '<p>No comments yet.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentDate = new Date(comment.created_at).toLocaleString();
            
           
            const commentUser = comment.user || 'Unknown User';
            
            commentsList.innerHTML += `
                <div class="comment-card">
                    <strong>${commentUser}</strong> <small>on ${commentDate}</small>
                    <p>${comment.body}</p> 
                </div>
            `;
        });
    }

    
    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        commentSubmitBtn.disabled = true;
        commentMessage.textContent = ''; 
        
        const text = commentText.value;
        if (!text) {
             commentSubmitBtn.disabled = false; 
             return; 
        }
        
       
        const data = { body: text, ticket: ticketId }; 
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                commentText.value = ''; 
                fetchComments(); 
                showAgentMessage(commentMessage, 'Reply posted!', 'success');
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }
        } catch (error) {
            showAgentMessage(commentMessage, `Error posting comment: ${error.message}`, 'error');
        } finally {
            commentSubmitBtn.disabled = false;
        }
    });

    
    updateTicketBtn.addEventListener('click', async () => {
        const newStatus = statusSelect.value;
        const data = { status: newStatus };
        updateTicketBtn.disabled = true;
        updateMessage.textContent = ''; 

        try {
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/`, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showAgentMessage(updateMessage, 'Ticket updated successfully!', 'success');
                fetchTicketDetails(); 
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }

        } catch (error) {
            showAgentMessage(updateMessage, `Error updating status: ${error.message}`, 'error');
        } finally {
            updateTicketBtn.disabled = false;
        }
    });

    
    deleteTicketBtn.addEventListener('click', async () => {
        
        
        const confirmation = confirm("Are you SURE you want to delete this ticket?\nThis action cannot be undone.");
        
        if (!confirmation) {
            return; 
        }

        deleteTicketBtn.disabled = true;
        deleteMessage.textContent = 'Deleting...';

        try {
            
            const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/`, {
                method: 'DELETE', 
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
                
            });

            if (response.ok) { 
                
                showAgentMessage(deleteMessage, 'Ticket deleted! Redirecting to queue...', 'success');
                
                
                setTimeout(() => {
                    window.location.href = 'dashboard-agent.html';
                }, 2000);

            } else if (response.status === 403) {
                throw new Error('Permission Denied (You might not be an admin).');
            } else {
                const err = await response.json();
                throw new Error(JSON.stringify(err));
            }

        } catch (error) {
            showAgentMessage(deleteMessage, `Error: ${error.message}`, 'error');
            deleteTicketBtn.disabled = false;
        }
    });


    
    fetchTicketDetails();
    fetchComments();
});