import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import cartRoutes from './routes/cart';
import { logEvent } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 80;

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Serve static assets (product images)
app.use('/assets', express.static(path.join(__dirname, '../assets'), { maxAge: '7d' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), { maxAge: '7d' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global API error handler
app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logEvent('UNHANDLED_ERROR', err.message || 'Unknown error');
  res.status(500).json({ error: 'Internal server error' });
});

// Serve React frontend
const clientBuildPath = path.join(__dirname, '../client');
app.use(express.static(clientBuildPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  logEvent('SERVER_STARTED', `port=${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

export default app;
