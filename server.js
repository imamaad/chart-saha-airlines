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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// API endpoint to save data.json
app.post('/api/save-data', upload.single('data'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایل ارسال نشده است' });
    }

    const dataContent = req.file.buffer.toString();
    
    // Validate JSON
    try {
      JSON.parse(dataContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'فایل JSON نامعتبر است' });
    }

    // Save to public/data.json
    const dataPath = path.join(__dirname, 'public', 'data.json');
    await fs.writeFile(dataPath, dataContent, 'utf8');

    console.log('✅ Data saved successfully to data.json');
    res.json({ 
      success: true, 
      message: 'داده‌ها با موفقیت ذخیره شدند',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error saving data:', error);
    res.status(500).json({ 
      error: 'خطا در ذخیره فایل',
      details: error.message 
    });
  }
});

// Serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Data file location: ${path.join(__dirname, 'public', 'data.json')}`);
});
