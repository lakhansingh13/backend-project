// 🔥 IMPORTANT: don't load .env in test (prevents NODE_ENV override)
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

const express = require('express');
const app = express();

/* ================= DAY 20: SWAGGER ================= */
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger_config');

/* ================= DAY 15: SECURITY ================= */
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

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

client.on('error', (err) => console.log('Redis Client Error', err));

/* ================= DAY 10: SOCKET ================= */
const http = require('http');
const { Server } = require('socket.io');

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

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= SWAGGER ================= */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ================= RATE LIMIT ================= */
app.use('/api/', apiLimiter);

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test API endpoint
 *     description: Returns a simple message to verify API is working
 *     responses:
 *       200:
 *         description: Successful response
 */
app.get('/api/test', apiLimiter, (req, res) => {
  res.json({ message: "API working 🚀" });
});

/* ================= BASIC ROUTE ================= */
app.get('/', (req, res) => {
  res.send('Server running correctly');
});

/* ================= LOGIN ================= */
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

/* ================= POSTS (REDIS CACHE) ================= */
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

/* ================= SOCKET ================= */
io.on('connection', (socket) => {
  socket.on('join_room', (room) => socket.join(room));

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data.message);
  });
});

/* ================= SERVER START ================= */
const port = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  await client.connect();
  console.log("Redis connected");

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

/* 🔥 FINAL SAFE START (never runs in test) */
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

/* ================= EXPORT ================= */
module.exports = app;