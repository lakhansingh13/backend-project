require('dotenv').config();

const express = require('express');
const app = express();

// =====Day 8 : Data Relationship ====
const Post = require('./models/Post');

// ===== DAY 5: DB + Model =====
const connectDB = require('./db');
const User = require('./models/User');

// ===== DAY 6: Auth Libraries =====
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;
const apiKey = process.env.API_KEY;

/* ========== DAY 3: Middleware ========== */
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// JSON Middleware
app.use(express.json());

// Connect DB
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

// Status route
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

// Basic Register
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

/* ========== DAY 6: Login + JWT ========== */

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      "my_secret_key",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========== DAY 6: Protected Route ========== */

const auth = require('./middleware/auth');

app.get('/dashboard', auth, (req, res) => {
  res.send("Welcome to the Private Dashboard");
});

/* ========== DAY 8: Create Post (with User link) ========== */

app.post('/api/posts', auth, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id // from JWT
    });

    const post = await newPost.save();
    res.json(post);

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ========== DAY 8: Get Posts with Author Details ========== */

/*app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', ['username', 'email']);
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
}); */

/* ========== DAY 9: Updated Paginated Posts ========== */

app.get('/api/posts', async (req, res) => {
  try {
    // Step 1: Get page & limit from URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    // Step 2: Calculate skip
    const skip = (page - 1) * limit;

    // Step 3: Fetch data
    const posts = await Post.find()
      .populate('author', ['username', 'email'])
      .skip(skip)
      .limit(limit);

    // Step 4: Send response
    res.json(posts);

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ========== SERVER START ========== */

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});