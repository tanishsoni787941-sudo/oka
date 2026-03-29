import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
let adminApp: admin.app.App;
if (!admin.apps.length) {
  try {
    const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    console.log('FIREBASE_SERVICE_ACCOUNT length:', saEnv?.length || 0);
    
    let serviceAccount = null;
    if (saEnv && saEnv.trim()) {
      try {
        // Try parsing as JSON first
        serviceAccount = JSON.parse(saEnv);
        console.log('Successfully parsed FIREBASE_SERVICE_ACCOUNT JSON.');
      } catch (parseError: any) {
        console.warn('FIREBASE_SERVICE_ACCOUNT is not valid JSON, trying base64 decode...');
        try {
          // Try decoding as base64
          const decoded = Buffer.from(saEnv, 'base64').toString('utf-8');
          serviceAccount = JSON.parse(decoded);
          console.log('Successfully parsed FIREBASE_SERVICE_ACCOUNT from base64.');
        } catch (base64Error: any) {
          console.error('\n❌ ERROR: FIREBASE_SERVICE_ACCOUNT is not a valid JSON string or Base64 encoded JSON.');
          console.error('Please ensure you copied the ENTIRE contents of the Firebase Service Account JSON file.');
          console.error('Go to AI Studio Settings -> Secrets, and paste the raw JSON string.\n');
        }
      }
    }

    if (serviceAccount) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'gen-lang-client-0802700312',
      });
      console.log('Firebase Admin initialized with service account.');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not found or invalid. Admin features will be limited.');
      adminApp = admin.initializeApp({
        projectId: 'gen-lang-client-0802700312',
      });
    }
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin:', error.message);
    adminApp = admin.initializeApp({
      projectId: 'gen-lang-client-0802700312',
    });
  }
} else {
  adminApp = admin.app();
}

const db = getFirestore(adminApp, 'ai-studio-899579eb-aef1-4dd1-a187-3b06e8bcd2e5');
const auth = admin.auth(adminApp);

async function startServer() {
  console.log('Starting server...');
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Middleware to check if the requester is an admin
  const checkAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log('Admin check - Auth Header present:', !!authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('Admin check failed: Missing or invalid Bearer token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    console.log('Admin check - Token length:', idToken?.length);

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log('Admin check - Decoded token for:', decodedToken.email);
      
      // Allow default admin by email
      if (decodedToken.email === 'tanishsoni787941@gmail.com') {
        console.log('Admin check - Authorized as default admin');
        next();
        return;
      }

      // If we don't have a service account, we can't check Firestore roles
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        return res.status(503).json({ 
          error: 'Admin features are not configured. Please add the FIREBASE_SERVICE_ACCOUNT secret in AI Studio Settings.' 
        });
      }

      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (userData?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      next();
    } catch (error: any) {
      console.error('Admin check error:', error);
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
        return res.status(503).json({ 
          error: 'Firebase Admin has insufficient permissions. Please ensure the FIREBASE_SERVICE_ACCOUNT is correct and has the "Firebase Admin" role.' 
        });
      }
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  app.post('/api/admin/delete-user', checkAdmin, async (req, res) => {
    const { uid } = req.body;
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(503).json({ 
        error: 'Admin features are not configured. Please add the FIREBASE_SERVICE_ACCOUNT secret in AI Studio Settings.' 
      });
    }

    try {
      await auth.deleteUser(uid);
      await db.collection('users').doc(uid).delete();
      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/create-user', checkAdmin, async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(503).json({ 
        error: 'Admin features are not configured. Please add the FIREBASE_SERVICE_ACCOUNT secret in AI Studio Settings.' 
      });
    }

    try {
      // 1. Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // 2. Create user profile in Firestore
      const studentId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.collection('users').doc(userRecord.uid).set({
        id: userRecord.uid,
        full_name: name,
        email: email,
        role: 'student',
        created_at: Date.now(),
        completed_videos: [],
        progress_percentage: 0,
        is_blocked: false,
        student_id: studentId,
        profile_photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRecord.uid}`
      });

      res.json({ success: true, uid: userRecord.uid });
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/toggle-user-status', checkAdmin, async (req, res) => {
    const { uid, disabled } = req.body;
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(503).json({ 
        error: 'Admin features are not configured. Please add the FIREBASE_SERVICE_ACCOUNT secret in AI Studio Settings.' 
      });
    }

    try {
      await auth.updateUser(uid, { disabled });
      await db.collection('users').doc(uid).update({ is_blocked: disabled });
      res.json({ success: true });
    } catch (error: any) {
      console.error('Toggle status error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
