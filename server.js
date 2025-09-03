import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Resolve target file
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(PUBLIC_DIR, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Read current data.json
app.get('/api/data', async (req, res) => {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    res.type('application/json').send(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'data.json not found', path: DATA_FILE });
    }
    res.status(500).json({ error: 'failed to read data.json', details: err.message, path: DATA_FILE });
  }
});

// Save data.json
app.post('/api/save-data', upload.single('data'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایل ارسال نشده است' });
    }

    const dataContent = req.file.buffer.toString();

    // Validate JSON
    let parsed;
    try {
      parsed = JSON.parse(dataContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'فایل JSON نامعتبر است' });
    }

    // Ensure directory exists
    await fs.mkdir(PUBLIC_DIR, { recursive: true });

    // Save to public/data.json
    await fs.writeFile(DATA_FILE, JSON.stringify(parsed, null, 2), 'utf8');

    // Stat after write
    const stats = await fs.stat(DATA_FILE);

    console.log('✅ Data saved to:', DATA_FILE, 'size:', stats.size);
    res.json({ 
      success: true,
      message: 'داده‌ها با موفقیت ذخیره شدند',
      path: DATA_FILE,
      size: stats.size,
      mtime: stats.mtime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error saving data:', error);
    res.status(500).json({ 
      error: 'خطا در ذخیره فایل',
      details: error.message,
      path: DATA_FILE 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📁 Data file target: ${DATA_FILE}`);
});
