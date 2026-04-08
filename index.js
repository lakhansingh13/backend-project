require('dotenv').config(); // Load variables from .env

const express = require('express');
const app = express();

const port = process.env.PORT || 5000;
const apiKey = process.env.API_KEY;

// Status route 
app.get('/status', (req, res) => {
  res.json({
    message: "System Online",
    environment_port: port,
    auth_status: apiKey ? "Securely Loaded" : "Missing Key"
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));

const userController = require('./controllers/userController');

app.get('/api/users', userController.getUsers);

// Middleware to read JSON from the "Body" of a request
app.use(express.json());

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and Password are required!" });
  }

  res.status(201).json({
    message: "User Registered Successfully",
    user: username
  });
});