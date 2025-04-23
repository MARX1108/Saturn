import multer from 'multer';
import path from 'path';
import fs from 'fs';

export interface UploadOptions {
  destination: string;
  fileTypes?: string[];
  maxFileSize?: number;
  fileNamePrefix?: string;
}

export function configureMulter(options: UploadOptions): multer.Multer {
  const {
    destination,
    fileTypes = ['image/'],
    maxFileSize = 5 * 1024 * 1024,
    fileNamePrefix = '',
  } = options;

  // Create full path from project root
  const fullPath = path.join(process.cwd(), destination);
  fs.mkdirSync(fullPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = fileNamePrefix
        ? `${fileNamePrefix}-${uniqueSuffix}${path.extname(file.originalname)}`
        : `${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, cb) => {
      const isAllowed = fileTypes.some(type => file.mimetype.startsWith(type));
      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${fileTypes.join(', ')} files are allowed`));
      }
    },
  });
}

export function moveUploadedFile(
  sourcePath: string,
  destDir: string,
  fileName: string
): string {
  fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, fileName);
  fs.renameSync(sourcePath, destPath);
  return destPath;
}
