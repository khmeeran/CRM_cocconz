// Use localStorage to persist the backend URL if testing on your PC
// Teachers can set this once in the console: localStorage.setItem('api_base', 'https://your-tunnel.trycloudflare.com')
const API_BASE = localStorage.getItem('api_base') || ""; 

// RBAC Configuration
const PAGE_ACCESS = {
    'admin.html': ['ADMIN', 'TEACHER', 'OFFICE', 'ACCOUNTANT'],
    'admin_v2.html': ['ADMIN', 'TEACHER', 'OFFICE', 'ACCOUNTANT'],
    'users.html': ['ADMIN'],
    'attendance.html': ['ADMIN', 'TEACHER', 'OFFICE'],
    'fees.html': ['ADMIN', 'OFFICE', 'ACCOUNTANT'],
    'collect_fees.html': ['ADMIN', 'OFFICE', 'ACCOUNTANT'],
    'accounts.html': ['ADMIN', 'ACCOUNTANT'],
    'staff.html': ['ADMIN', 'OFFICE'],
    'transport.html': ['ADMIN', 'OFFICE', 'TEACHER'],
    'students.html': ['ADMIN', 'OFFICE', 'TEACHER', 'ACCOUNTANT'],
    'admission.html': ['ADMIN', 'OFFICE'],
    'broadcast.html': ['ADMIN', 'OFFICE'],
    'proxy.html': ['ADMIN', 'OFFICE', 'TEACHER']
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Security Check
(function() {
    const role = localStorage.getItem('user_role');
    const hasCsrf = getCookie('csrf_token');
    const path = window.location.pathname.split('/').pop();

    if ((!role || !hasCsrf) && path !== 'login.html') {
        window.location.href = '/frontend/login.html';
        return;
    }

    if (role && hasCsrf && PAGE_ACCESS[path] && !PAGE_ACCESS[path].includes(role)) {
        alert("Access Denied: You don't have permission for this module.");
        window.location.href = '/frontend/admin.html';
    }
})();

async function secureFetch(url, options = {}) {
    options.credentials = 'include'; // Ensure cookies are sent
    
    // Add CSRF token for mutations
    const method = options.method || 'GET';
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
        const csrfToken = getCookie('csrf_token');
        options.headers = {
            ...options.headers,
            'X-CSRF-Token': csrfToken
        };
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        localStorage.removeItem('user_role');
        window.location.href = '/frontend/login.html';
        return;
    }

    return response;
}

async function logout() {
    try {
        await fetch(`${API_BASE}/api/logout`, { 
            method: 'POST', 
            credentials: 'include', 
            headers: {'X-CSRF-Token': getCookie('csrf_token')} 
        });
    } catch(e) {}
    localStorage.removeItem('user_role');
    window.location.href = '/frontend/login.html';
}