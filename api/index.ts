import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app instance
const app = express();

// Configure body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure CORS for production
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize routes asynchronously
let routesInitialized = false;
const initPromise = registerRoutes(app).then(() => {
  routesInitialized = true;
  console.log('Routes initialized successfully');
}).catch((error) => {
  console.error('Failed to initialize routes:', error);
});

// Vercel serverless function handler
const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Wait for routes to be initialized
  if (!routesInitialized) {
    await initPromise;
  }
  
  // Pass the request to Express
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        console.error('Handler error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export default handler;