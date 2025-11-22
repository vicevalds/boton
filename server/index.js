import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Crear directorio de grabaciones si no existe
const recordingsDir = join(__dirname, 'recordings');
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

// Configuración de multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, recordingsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `recording_${timestamp}.webm`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para subir grabaciones
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }

  // Enviar el audio al endpoint externo
  let externalResponse = null;
  try {
    const formData = new FormData();
    const filePath = join(recordingsDir, req.file.filename);
    formData.append('audio', fs.createReadStream(filePath), {
      filename: req.file.filename,
      contentType: 'audio/webm',
    });

    const response = await fetch('https://app.vvaldes.me/api/audio/external', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const responseText = await response.text();
    externalResponse = {
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      body: responseText,
    };

    console.log('Respuesta del servidor externo:', externalResponse);
  } catch (error) {
    console.error('Error al enviar audio al servidor externo:', error);
    externalResponse = {
      success: false,
      error: error.message,
    };
  }

  res.json({
    success: true,
    filename: req.file.filename,
    path: `/api/recordings/${req.file.filename}`,
    externalResponse,
  });
});

// Ruta para obtener lista de grabaciones
app.get('/api/recordings', (req, res) => {
  fs.readdir(recordingsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer grabaciones' });
    }

    const recordings = files
      .filter((file) => file.endsWith('.webm'))
      .map((file) => {
        const stats = fs.statSync(join(recordingsDir, file));
        return {
          filename: file,
          timestamp: stats.mtime,
          size: stats.size,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json(recordings);
  });
});

// Ruta para servir archivos de audio
app.get('/api/recordings/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = join(recordingsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  res.sendFile(filePath);
});

// Ruta para eliminar grabaciones (opcional)
app.delete('/api/recordings/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = join(recordingsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar archivo' });
    }
    res.json({ success: true });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir archivos estáticos del frontend en producción
if (isProduction) {
  const distPath = join(__dirname, '..', 'dist');
  const fontsPath = join(__dirname, '..', 'public', 'fonts');
  
  // Servir fuentes
  app.use('/fonts', express.static(fontsPath));
  
  // Servir archivos estáticos del build
  app.use(express.static(distPath));
  
  // SPA fallback - todas las rutas que no sean /api devuelven index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint no encontrado' });
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`Modo: ${isProduction ? 'Producción' : 'Desarrollo'}`);
  console.log(`Directorio de grabaciones: ${recordingsDir}`);
  if (isProduction) {
    console.log(`Sirviendo frontend desde: ${join(__dirname, '..', 'dist')}`);
  }
});

