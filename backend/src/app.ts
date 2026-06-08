import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { router as apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.js';

const app = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*', // Allow all origins for the development / dashboard client
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Server Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduSync AI API Server is operational.',
    timestamp: new Date().toISOString(),
  });
});

// Mount Central API Router
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start listening
const server = app.listen(config.port, () => {
  console.log(`🚀 EduSync AI server running in [${config.nodeEnv}] on http://localhost:${config.port}`);
});

export default app;
