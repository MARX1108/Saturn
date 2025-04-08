import multer from "multer";
import path from "path";
import fs from "fs/promises"; // Use async promises version

export class UploadService {
  /**
   * Configures multer storage with dynamic destination
   * @param uploadDir Optional custom upload directory path
   * @returns Configured multer storage
   */
  private configureStorage(uploadDir?: string) {
    const defaultDir = path.join(process.cwd(), "uploads");
    const destination = uploadDir || defaultDir;

    return multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          await fs.mkdir(destination, { recursive: true });
          cb(null, destination);
        } catch (err) {
          cb(err instanceof Error ? err : new Error(String(err)), "");
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });
  }

  /**
   * Creates a multer middleware configured for image uploads
   * @param options Configuration options
   * @returns Configured multer middleware
   */
  public configureImageUploadMiddleware(options?: {
    fileSizeLimitMB?: number;
    uploadDir?: string;
  }) {
    const fileSizeLimit = (options?.fileSizeLimitMB || 5) * 1024 * 1024; // Default 5MB

    return multer({
      storage: this.configureStorage(options?.uploadDir),
      limits: { fileSize: fileSizeLimit },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true); // Accept file
        } else {
          cb(new Error("Invalid file type: Only image files are allowed.")); // Reject file
        }
      },
    });
  }

  /**
   * Creates a multer middleware configured for media uploads (images, videos, audio)
   * @param options Configuration options
   * @returns Configured multer middleware
   */
  public configureMediaUploadMiddleware(options?: {
    fileSizeLimitMB?: number;
    uploadDir?: string;
    allowedTypes?: string[];
  }) {
    const fileSizeLimit = (options?.fileSizeLimitMB || 10) * 1024 * 1024; // Default 10MB
    const allowedTypes = options?.allowedTypes || [
      "image/",
      "video/",
      "audio/",
    ];

    return multer({
      storage: this.configureStorage(options?.uploadDir),
      limits: { fileSize: fileSizeLimit },
      fileFilter: (req, file, cb) => {
        const isAllowed = allowedTypes.some((type) =>
          file.mimetype.startsWith(type),
        );

        if (isAllowed) {
          cb(null, true); // Accept file
        } else {
          cb(
            new Error(
              `Invalid file type: Only ${allowedTypes.join(", ").replace(/\//g, "")} files are allowed.`,
            ),
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
  public async moveUploadedFile(
    file: Express.Multer.File,
    targetDir: string,
    customFilename?: string,
  ) {
    // Create target directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true });

    // Generate filename if not provided
    const fileName =
      customFilename ||
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

    const finalPath = path.join(targetDir, fileName);

    // Move file using async fs.rename
    await fs.rename(file.path, finalPath);

    return {
      path: finalPath,
      filename: fileName,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
