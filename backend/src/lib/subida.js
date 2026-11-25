import multer from 'multer';

const PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// Fotos en memoria (máx. 10 MB c/u, máx. 10 por envío) para subirlas a Blob Storage
export const subidaFotos = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (PERMITIDOS.includes(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Formato no permitido. Use JPG o PNG.'), { status: 400 }));
  }
});
