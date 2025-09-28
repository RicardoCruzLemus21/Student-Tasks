const API_URL = ''; // Mismo origen, ya que backend sirve el frontend

// Registro
async function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        const message = document.getElementById('message');
        if (res.ok) {
            message.textContent = 'Registro exitoso. Redirigiendo a login...';
            message.style.color = 'green';
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            message.textContent = data.error;
        }
    } catch (err) {
        console.error(err);
    }
}

// Login
async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        const message = document.getElementById('loginMessage');
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            window.location.href = 'tasks.html';
        } else {
            message.textContent = data.error;
        }
    } catch (err) {
        console.error(err);
    }
}

// Crear tarea
async function createTask(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });
        const message = document.getElementById('taskMessage');
        if (res.ok) {
            loadTasks();
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            message.textContent = '';
        } else {
            const data = await res.json();
            message.textContent = data.error;
        }
    } catch (err) {
        console.error(err);
    }
}

// Cargar tareas
async function loadTasks() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/tasks/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(res.status);
        const tasks = await res.json();
        const list = document.getElementById('taskList');
        list.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'Sin descripción'}</p>
                <p>Status: ${task.status}</p>
                <button onclick="updateTaskStatus(${task.id})">Avanzar Status</button>
            `;
            list.appendChild(li);
        });
    } catch (err) {
        if (err.message === '401') logout();
        console.error(err);
    }
}

// Actualizar status
async function updateTaskStatus(taskId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) loadTasks();
    } catch (err) {
        console.error(err);
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
}

// Event listeners
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', registerUser);
}
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', loginUser);
}
if (document.getElementById('createTaskForm')) {
    document.addEventListener('DOMContentLoaded', loadTasks);
    document.getElementById('createTaskForm').addEventListener('submit', createTask);
}
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', logout);
}