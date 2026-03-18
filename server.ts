import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

app.use(express.json());
app.use(cookieParser());

// Initialize SQLite Database
const db = new Database('database.sqlite');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    profile_photo TEXT,
    active_device_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed INTEGER NOT NULL,
    completion_date INTEGER NOT NULL,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  );
`);

// Initialize student count if not exists
const initMetadata = db.prepare('INSERT OR IGNORE INTO metadata (key, value) VALUES (?, ?)');
initMetadata.run('student_count', 0);

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Middleware to authenticate JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { fullName, email, password, profilePhoto, deviceId } = req.body;
  
  try {
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate Student ID
    let studentId = '';
    db.transaction(() => {
      db.prepare("UPDATE metadata SET value = value + 1 WHERE key = 'student_count'").run();
      const countRow: any = db.prepare("SELECT value FROM metadata WHERE key = 'student_count'").get();
      studentId = `OMF-${String(countRow.value).padStart(4, '0')}`;
      
      const userId = generateId();
      const now = Date.now();
      
      db.prepare(`
        INSERT INTO users (id, full_name, email, password, student_id, profile_photo, active_device_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, fullName, email, hashedPassword, studentId, profilePhoto || '', deviceId, now);
    })();

    const user: any = db.prepare('SELECT id, full_name, email, student_id, profile_photo, active_device_id, created_at FROM users WHERE email = ?').get(email);
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, deviceId } = req.body;
  
  try {
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update active device
    db.prepare('UPDATE users SET active_device_id = ? WHERE id = ?').run(deviceId, user.id);
    user.active_device_id = deviceId;

    // Remove password from response
    delete user.password;

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Get Current User
app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
  try {
    const user: any = db.prepare('SELECT id, full_name, email, student_id, profile_photo, active_device_id, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Progress
app.get('/api/progress', authenticateToken, (req: any, res: any) => {
  try {
    const progress = db.prepare('SELECT lesson_id, completed, completion_date FROM progress WHERE user_id = ?').all(req.user.id);
    res.json({ progress });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Progress
app.post('/api/progress', authenticateToken, (req: any, res: any) => {
  const { lessonId } = req.body;
  try {
    const id = `${req.user.id}_${lessonId}`;
    const now = Date.now();
    db.prepare(`
      INSERT INTO progress (id, user_id, lesson_id, completed, completion_date)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = 1, completion_date = ?
    `).run(id, req.user.id, lessonId, now, now);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
