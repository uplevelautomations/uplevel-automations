import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatHandler } from './api/chat';
import { extractProcessDataHandler } from './api/extract-process-data';
import { generatePdfHandler } from './api/generate-pdf';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
// API Routes
app.post('/api/chat', chatHandler);
app.post('/api/extract-process-data', extractProcessDataHandler);
app.post('/api/generate-pdf', generatePdfHandler);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
