const express = require('express');
const cors = require('cors');
const path = require('path');
const { register, login } = require('./controllers/userController');
const { createTask, getTasks, updateStatus } = require('./controllers/tasksController');
const authenticate = require('./middleware/auth');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Endpoints
app.post('/users/register', register);
app.post('/users/login', login);
app.post('/tasks', authenticate, createTask);
app.get('/tasks/:userId', authenticate, getTasks);
app.put('/tasks/:id/status', authenticate, updateStatus);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));