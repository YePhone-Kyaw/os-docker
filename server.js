const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 8080;

app.use(express.json());


const pool = new Pool({
    user: 'postgres',
    host: 'db-container',
    database: 'studentdb',
    password: 'admin',
    port: 5432
});

app.post('/student', async (req, res) => {
    const { studentID, studentName, course, presentDate } = req.body;
    try {
        const checkResult = await pool.query('SELECT * FROM students WHERE studentID = $1', [studentID]);
        if (checkResult.rows.length > 0) {
            return res.status(409).json({
                message: 'Student already exists'
            });
        }
        const result = await pool.query('INSERT INTO students (studentID, studentName, course, presentDate) VALUES ($1, $2, $3, $4) RETURNING *', [studentID, studentName, course, presentDate]);
        res.status(201).json({
            message: 'Student created successfully', student: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/student/:id', async (req, res) => {
    const { id } = req.params;
    const { studentName, course, presentDate } = req.body;
    try {
        const checkResult = await pool.query('SELECT * FROM students WHERE studentID = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const result = await pool.query(
            'UPDATE students SET studentName = $1, course = $2, presentDate = $3 WHERE studentID = $4 RETURNING *',
            [studentName, course, presentDate, id]
        );
        res.status(200).json({ message: 'Student updated successfully', student: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});

