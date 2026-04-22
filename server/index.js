const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key'; // In a real app, use an environment variable

app.use(cors());
app.use(bodyParser.json());

// Mock database
const users = [
    { email: 'user@example.com', password: 'password123' }
];

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    console.log(`Login attempt: ${email}`);

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: { email: user.email }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
