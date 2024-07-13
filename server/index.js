const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// GET endpoint to fetch tasks from database
app.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM tasks ORDER BY id');
        const tasks = result.rows;
        client.release();
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to add a new task to database
app.post('/add-task', async (req, res) => {
    const { todo } = req.body;
    if (!todo) {
        return res.status(400).json({ error: 'Todo is required' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO tasks (todo) VALUES ($1) RETURNING *', [todo]);
        const newTask = result.rows[0];
        client.release();
        res.status(201).json({
            message: 'Task added successfully',
            task: newTask,
        });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/delete-task/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM tasks WHERE id = $1', [taskId]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT endpoint to update a task in the database
app.put('/update-task/:id', async (req, res) => {
    const taskId = req.params.id;
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).json({ error: 'Todo is required' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query('UPDATE tasks SET todo = $1 WHERE id = $2 RETURNING *', [todo, taskId]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updatedTask = result.rows[0];
        res.json({
            message: 'Task updated successfully',
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is listening on port ${port}`);
});
