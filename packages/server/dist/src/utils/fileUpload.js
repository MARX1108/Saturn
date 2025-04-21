'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.configureMulter = configureMulter;
exports.moveUploadedFile = moveUploadedFile;
const multer_1 = __importDefault(require('multer'));
const path_1 = __importDefault(require('path'));
const fs_1 = __importDefault(require('fs'));
function configureMulter(options) {
  const {
    destination,
    fileTypes = ['image/'],
    maxFileSize = 5 * 1024 * 1024,
    fileNamePrefix = '',
  } = options;
  // Create full path from project root
  const fullPath = path_1.default.join(process.cwd(), destination);
  fs_1.default.mkdirSync(fullPath, { recursive: true });
  const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = fileNamePrefix
        ? `${fileNamePrefix}-${uniqueSuffix}${path_1.default.extname(file.originalname)}`
        : `${uniqueSuffix}${path_1.default.extname(file.originalname)}`;
      cb(null, fileName);
    },
  });
  return (0, multer_1.default)({
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
function moveUploadedFile(sourcePath, destDir, fileName) {
  fs_1.default.mkdirSync(destDir, { recursive: true });
  const destPath = path_1.default.join(destDir, fileName);
  fs_1.default.renameSync(sourcePath, destPath);
  return destPath;
}
