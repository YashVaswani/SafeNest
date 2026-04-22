require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { db } = require('./db');
const { users } = require('./db/schema');
const { eq } = require('drizzle-orm');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log(`Login attempt: ${email}`);

    try {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = result[0];

        if (user && user.password === password) { // In production, use bcrypt
            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
            return res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: { id: user.id, email: user.email }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Register Endpoint (for testing)
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        await db.insert(users).values({ email, password });
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running with Drizzle' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
