import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import partnerRoutes from './routes/partners.js';
import reportRoutes from './routes/reports.js';
import todoRoutes from './routes/todos.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/todos', todoRoutes);

app.use(express.static(path.join(__dirname, '../partnership-app/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../partnership-app/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
