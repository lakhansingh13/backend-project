require('dotenv').config();

const express = require('express');
const app = express();
  
// ==== Day 12: Redis Setup =====
const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  url:  process.env.REDIS_URL
});

// Connect Redis
client.connect()
  .then(() => console.log("Redis connected"))
  .catch(err => console.log(err));

// ===== DAY 10: Socket Setup =====
const http = require('http');
const { Server } = require('socket.io');

const { Worker } = require('worker_threads'); // ✅ Day 11

// =====Day 8 : Data Relationship ====
const Post = require('./models/Post');

// ===== DAY 5: DB + Model =====
const connectDB = require('./db');
const User = require('./models/User');

// ===== DAY 6: Auth Libraries =====
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===== DAY 6: Auth Middleware =====
const auth = require('./middleware/auth');

const port = process.env.PORT || 5000;
const apiKey = process.env.API_KEY;

// ===== DAY 10: Wrap Express =====
const server = http.createServer(app);

// ===== DAY 10: Socket Init =====
const io = new Server(server, {
  cors: { origin: "*" }
});

// ===== DAY 10: Socket Authentication =====
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    // Check if token exists
    if (!token) {
      return next(new Error("No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, "my_secret_key");

    // Attach user info
    socket.user = decoded;

    next(); // allow connection
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

/* ========== DAY 10: SOCKET LOGIC ========== */

io.on('connection', (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Send message to room
  socket.on('send_message', (data) => {
    console.log("Message:", data);

    io.to(data.room).emit('receive_message', data.message);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});

/* ========== DAY 3: Middleware ========== */

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

app.use(express.json());

// Connect DB
connectDB();

/* ========== DAY 2: Basic Routes ========== */

app.get('/', (req, res) => {
  res.send('Server running correctly');
});

app.get('/admin', (req, res) => {
  res.send('<h1>Welcome Admin</h1>');
});

/* ========== DAY 3: APIs ========== */

let users = [
  { id: 1, name: "Alice", status: "Active" },
  { id: 2, name: "Bob", status: "Away" },
  { id: 3, name: "Charlie", status: "Offline" }
];

app.get('/about', (req, res) => {
  res.send('This is the About API — Backend logic is active.');
});

app.get('/user', (req, res) => {
  res.json({
    name: "John",
    age: 22,
    role: "Developer"
  });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

/* ========== DAY 4: Environment + Advanced APIs ========== */

app.get('/status', (req, res) => {
  res.json({
    message: "System Online",
    environment_port: port,
    auth_status: apiKey ? "Securely Loaded" : "Missing Key"
  });
});

const userController = require('./controllers/userController');
app.get('/api/users-controller', userController.getUsers);

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

/* ========== DAY 5: DATABASE ========== */

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

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

app.get('/dashboard', auth, (req, res) => {
  res.send("Welcome to the Private Dashboard");
});

/* ========== DAY 8: Create Post ========== */

app.post('/api/posts', auth, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id
    });

    const post = await newPost.save();
    res.json(post);

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ========== DAY 9: Paginated Posts ========== */

app.get('/api/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', ['username', 'email'])
      .skip(skip)
      .limit(limit);

    res.json(posts);

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ========== DAY 11: BLOCKING TASK (MAIN THREAD) ========== */

// ❌ This route runs heavy computation on MAIN THREAD
// Result: Server becomes unresponsive (FREEZE)

app.get('/api/block', (req, res) => {
  console.log("Block task started at:", new Date().toLocaleTimeString());

  let result = 0;

  // Heavy loop (CPU intensive task)
  for (let i = 0; i < 2000000000; i++) {
    result += i;
  }

  console.log("Block task completed at:", new Date().toLocaleTimeString());

  // Response after completion
  res.send("Blocking task done");
});

/* ========== DAY 11 WORKER THREAD ========== */

app.get('/api/heavy-task', (req, res) => {
  console.log("Heavy task started at:", new Date().toLocaleTimeString());

  const worker = new Worker('./worker.js', {
    workerData: { iterations: 100000000 }
  });

  worker.on('message', (result) => {
    console.log("Heavy task completed at:", new Date().toLocaleTimeString());

    res.json({
      success: true,
      result
    });
  });

  worker.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
});

/* ========== DAY 12: CACHE-ASIDE (REDIS) ========== */

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Check Redis (Cache)
    const cachedPost = await client.get(id);

    if (cachedPost) {
      console.log("Cache HIT 🔥");
      return res.json(JSON.parse(cachedPost));
    }

    // 2️⃣ Fetch from MongoDB
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // 3️⃣ Save to Redis (TTL = 1 hour)
    await client.setEx(id, 3600, JSON.stringify(post));

    console.log("Cache MISS ❌ → Data from DB");

    res.json(post);

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

/* ========== DAY 12: CACHE INVALIDATION ========== */

app.put('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Delete old cache
    await client.del(req.params.id);

    console.log("Cache cleared for updated post");

    res.json(post);

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

/* ========== SERVER START ========== */

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});