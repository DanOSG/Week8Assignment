require('dotenv').config();
const express = require('express');
const cors = require('cors');
const User = require('./models/user');
const app = express();
const port = 3001;

app.use(express.json());

// Use CORS middleware
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Replace with your frontend's origin
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Define the login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find the user in the database
    const user = await User.findOne({ where: { username } });

    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Simulate token generation (replace with actual logic)
    const token = 'mock-token';
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
