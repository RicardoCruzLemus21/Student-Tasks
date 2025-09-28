const db = require('../db');

const createTask = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.userId;
    try {
        const result = await db.query(
            'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const getTasks = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (userId !== req.userId) return res.status(403).json({ error: 'No autorizado' });
    try {
        const { rows } = await db.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const updateStatus = async (req, res) => {
    const taskId = req.params.id;
    try {
        const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
        if (rows[0].user_id !== req.userId) return res.status(403).json({ error: 'No autorizado' });

        let newStatus = rows[0].status;
        if (newStatus === 'pending') newStatus = 'in_progress';
        else if (newStatus === 'in_progress') newStatus = 'done';

        const result = await db.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            [newStatus, taskId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { createTask, getTasks, updateStatus };