'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.UploadService = void 0;
const multer_1 = __importDefault(require('multer'));
const path_1 = __importDefault(require('path'));
const promises_1 = __importDefault(require('fs/promises')); // Use async promises version
const fileUpload_1 = require('../../../utils/fileUpload');
class UploadService {
  /**
   * Configures multer storage with dynamic destination
   * @param uploadDir Optional custom upload directory path
   * @returns Configured multer storage
   */
  configureStorage(uploadDir) {
    const defaultDir = path_1.default.join(process.cwd(), 'uploads');
    const destination = uploadDir || defaultDir;
    return multer_1.default.diskStorage({
      destination: (req, file, cb) => {
        // Instead of awaiting the promise directly, which causes the linting error,
        // we'll handle it with a .then() chain to keep the callback synchronous
        void promises_1.default
          .mkdir(destination, { recursive: true })
          .then(() => {
            cb(null, destination);
          })
          .catch(err => {
            cb(err instanceof Error ? err : new Error(String(err)), '');
          });
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
      },
    });
  }
  /**
   * Creates a multer middleware configured for image uploads
   * @param options Configuration options
   * @returns Configured multer middleware
   */
  configureImageUploadMiddleware(options) {
    const fileSizeLimit = (options?.fileSizeLimitMB || 5) * 1024 * 1024; // Default 5MB
    return (0, multer_1.default)({
      storage: this.configureStorage(options?.uploadDir),
      limits: { fileSize: fileSizeLimit },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true); // Accept file
        } else {
          cb(new Error('Invalid file type: Only image files are allowed.')); // Reject file
        }
      },
    });
  }
  /**
   * Creates a multer middleware configured for media uploads (images, videos, audio)
   * @param options Configuration options
   * @returns Configured multer middleware
   */
  configureMediaUploadMiddleware(options) {
    const fileSizeLimit = (options?.fileSizeLimitMB || 10) * 1024 * 1024; // Default 10MB
    const allowedTypes = options?.allowedTypes || [
      'image/',
      'video/',
      'audio/',
    ];
    return (0, multer_1.default)({
      storage: this.configureStorage(options?.uploadDir),
      limits: { fileSize: fileSizeLimit },
      fileFilter: (req, file, cb) => {
        const isAllowed = allowedTypes.some(type =>
          file.mimetype.startsWith(type)
        );
        if (isAllowed) {
          cb(null, true); // Accept file
        } else {
          cb(
            new Error(
              `Invalid file type: Only ${allowedTypes.join(', ').replace(/\//g, '')} files are allowed.`
            )
          ); // Reject file
        }
      },
    });
  }
  /**
   * Moves an uploaded file from temporary storage to a permanent location
   * @param file The uploaded file from multer
   * @param targetDir Target directory path
   * @param customFilename Optional custom filename
   * @returns Object containing the new file path and URL information
   */
  async moveUploadedFile(file, targetDir, customFilename) {
    // Create target directory if it doesn't exist
    await promises_1.default.mkdir(targetDir, { recursive: true });
    // Generate filename if not provided
    const fileName =
      customFilename ||
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path_1.default.extname(file.originalname)}`;
    const finalPath = path_1.default.join(targetDir, fileName);
    // Move file using async fs.rename
    await promises_1.default.rename(file.path, finalPath);
    return {
      path: finalPath,
      filename: fileName,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
  /**
   * Alternative moveUploadedFile method that uses a subdirectory approach
   * @param file The uploaded file from multer
   * @param subDirectory Optional subdirectory within uploads
   * @returns File information
   */
  async moveUploadedFileToSubdir(file, subDirectory) {
    const destinationDir = path_1.default.join(
      process.cwd(),
      'uploads',
      subDirectory || 'media'
    );
    // Move file from temp to permanent location
    const filePath = (0, fileUpload_1.moveUploadedFile)(
      file.path,
      destinationDir,
      file.filename
    );
    // Get the relative path from cwd
    const relativePath = path_1.default.relative(process.cwd(), filePath);
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: relativePath,
    };
  }
}
exports.UploadService = UploadService;
