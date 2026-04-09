require('dotenv').config();

const express = require('express');
const app = express();

// Day 5 imports
const connectDB = require('./db');
const User = require('./models/User');

const port = process.env.PORT || 5000;
const apiKey = process.env.API_KEY;

/* ========== DAY 3: Middleware ========== */
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Middleware for JSON body (Day 4)
app.use(express.json());

// Connect Database (Day 5)
connectDB();

/* ========== DAY 2: Basic Routes ========== */

// Home
app.get('/', (req, res) => {
  res.send('Server running correctly');
});

// Admin
app.get('/admin', (req, res) => {
  res.send('<h1>Welcome Admin</h1>');
});

/* ========== DAY 3: APIs ========== */

let users = [
  { id: 1, name: "Alice", status: "Active" },
  { id: 2, name: "Bob", status: "Away" },
  { id: 3, name: "Charlie", status: "Offline" }
];

// About
app.get('/about', (req, res) => {
  res.send('This is the About API — Backend logic is active.');
});

// Single user
app.get('/user', (req, res) => {
  res.json({
    name: "John",
    age: 22,
    role: "Developer"
  });
});

// Users API
app.get('/api/users', (req, res) => {
  res.json(users);
});

/* ========== DAY 4: Environment + Advanced APIs ========== */

// Status route (env check)
app.get('/status', (req, res) => {
  res.json({
    message: "System Online",
    environment_port: port,
    auth_status: apiKey ? "Securely Loaded" : "Missing Key"
  });
});

// Controller route
const userController = require('./controllers/userController');
app.get('/api/users-controller', userController.getUsers);

// Register route (basic)
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

/* ========== DAY 5: DATABASE (MongoDB) ========== */

// Save user to DB
app.post('/register-db', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ========== SERVER START ========== */

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});