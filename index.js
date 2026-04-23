require('dotenv').config();

const express = require('express');
const app = express();

/* ================= DAY 15: SECURITY ================= */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Helmet (security headers)
app.use(helmet());

// Global API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict login limiter
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try again after 1 hour."
});

/* ================= DAY 12: REDIS ================= */

const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.connect()
  .then(() => console.log("Redis connected"))
  .catch(err => console.log(err));

/* ================= DAY 10: SOCKET ================= */

const http = require('http');
const { Server } = require('socket.io');
const { Worker } = require('worker_threads');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

/* ================= DB + MODELS ================= */

const connectDB = require('./db');
const User = require('./models/User');
const Post = require('./models/Post');

/* ================= AUTH ================= */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

/* ================= MIDDLEWARE ================= */

app.use(express.json());

// Apply limiter AFTER express
app.use('/api/', apiLimiter);

// Connect DB
connectDB();

/* ================= SOCKET AUTH ================= */

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, "my_secret_key");
    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

/* ================= SOCKET LOGIC ================= */

io.on('connection', (socket) => {
  socket.on('join_room', (room) => socket.join(room));

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data.message);
  });
});

/* ================= BASIC ROUTES ================= */

app.get('/', (req, res) => {
  res.send('Server running correctly');
});

/* ================= LOGIN (IMPORTANT 🔐) ================= */

// Apply strict limiter BEFORE route
app.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "my_secret_key", { expiresIn: "1h" });

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= POSTS ================= */

app.get('/api/posts/:id', async (req, res) => {
  try {
    const cached = await client.get(req.params.id);

    if (cached) {
      console.log("Cache HIT 🔥");
      return res.json(JSON.parse(cached));
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Not found");

    await client.setEx(req.params.id, 3600, JSON.stringify(post));

    console.log("Cache MISS ❌");

    res.json(post);

  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ================= SERVER ================= */

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});