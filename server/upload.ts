import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = new Set([
  // Images
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/avif',
  // Documents (PDF, Word, Text)
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/rtf',
  'text/rtf',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
  // Spreadsheets (Excel, CSV)
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.spreadsheet',
  'text/csv',
  'application/csv',
  'text/tab-separated-values',
  // Data / Backup
  'application/json',
  'text/json',
  // Generic binary streams (often sent by browsers for Excel/Word)
  'application/octet-stream'
]);

const allowedExtensions = new Set([
  // Images
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.bmp',
  '.ico',
  '.jfif',
  '.heic',
  '.heif',
  '.tiff',
  '.tif',
  '.avif',
  // Documents
  '.pdf',
  '.docx',
  '.doc',
  '.rtf',
  '.odt',
  '.txt',
  // Spreadsheets
  '.xlsx',
  '.xls',
  '.csv',
  '.tsv',
  '.ods',
  // Backup / Data
  '.json'
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase().split(';')[0].trim();

  // If mime starts with image/ or text/, or is in allowed sets, or extension is allowed
  if (
    mime.startsWith('image/') ||
    mime.startsWith('text/') ||
    allowedMimeTypes.has(mime) ||
    allowedExtensions.has(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Format file tidak didukung. Harap unggah file gambar (JPG, PNG, WebP), PDF, Word (.docx/.doc), Excel (.xlsx/.xls/.csv), atau berkas data cadangan (.json).'
      )
    );
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter
});

/**
 * Safe middleware wrapper for handling Multer uploads without uncaught server exceptions
 */
export const uploadSingle = (fieldName = 'file') => {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware.single(fieldName)(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
              error: 'Ukuran file melebihi batas maksimum 25MB. Silakan pilih file yang lebih kecil.'
            });
            return;
          }
          res.status(400).json({
            error: `Gagal mengunggah file: ${err.message}`
          });
          return;
        }

        // Custom validation error from fileFilter
        res.status(400).json({
          error:
            err.message ||
            'Format file tidak didukung. Harap unggah file gambar (JPG/PNG), PDF, Word, Excel, atau JSON.'
        });
        return;
      }
      next();
    });
  };
};
