import express from 'express';
import { getDb } from '../shared/db.js';
import { getPort, isDevelopment } from '../shared/config.js';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = getPort();

// Middleware
app.use(express.json());

// CORS for development
if (isDevelopment()) {
  app.use(cors());
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/translations', (req, res) => {
  try {
    const db = getDb();
    const translations = db.getTranslations();
    res.json(translations);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch translations'
    });
  }
});

// Serve static files in production
if (!isDevelopment()) {
  const buildPath = path.join(process.cwd(), 'web', 'dist');
  app.use(express.static(buildPath));

  // SPA fallback - serve index.html for non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
