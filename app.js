const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv'); // tout en haut

dotenv.config();
const app = express();
const PORT = 3000;
const securityLevel = parseInt(process.env.SECURITY || "2");

// Multer config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const staticMiddleware = express.static('uploads');
// Middleware pour changer Content-Type selon niveau et fichier
app.use('/uploads', (req, res, next) => {

  // Juste pour la demo/bypass

  if (securityLevel === 1) {
    res.setHeader('Content-Type', 'image/svg+xml'); 
  }

  // Juste pour la demo/bypass

  if (securityLevel === 2) {
    if (req.url.match(/\.(png|jpg|jpeg|gif)$/i)) {
      console.log(securityLevel)
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
  staticMiddleware(req, res, next);

});

app.get('/', (req, res) => {
  res.render('index', { file: null, level: securityLevel });
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('Aucun fichier envoyé');

  const ext = path.extname(req.file.originalname).toLowerCase();
  const filePath = `/uploads/${req.file.filename}`;

  // Niveau 1 : filtrage extension
  if (securityLevel >= 1) {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    if (!allowedExtensions.includes(ext)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send('Extension interdite');
    }
  }

  // Niveau 2 : vérification MIME réelle
  if (securityLevel >= 2) {
    const fileType = await import('file-type');
    const buffer = fs.readFileSync(req.file.path);
    const type = await fileType.fileTypeFromBuffer(buffer);

    if (!type || !['image/png', 'image/jpeg', 'image/gif'].includes(type.mime)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send('MIME type invalide');
    }
  }

  // Niveau 3 : sécuriser le rendu
  if (securityLevel >= 3) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', 'text/plain'); // désactive rendu HTML/SVG
  }

  res.render('index', { file: filePath, level: securityLevel });
});

app.listen(PORT, () => {
  console.log(`🧪 Upload Lab running at http://localhost:${PORT}`);
});
