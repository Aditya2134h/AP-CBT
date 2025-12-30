import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import systemConfig from '../../config/system';

export function setupFileUpload() {
  // Ensure upload directory exists
  const uploadDir = systemConfig.uploads.uploadDir;
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
  });

  const fileFilter = (req: NextApiRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = systemConfig.uploads.allowedTypes;
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type') as any, false);
    }
  };

  const limits = {
    fileSize: systemConfig.uploads.maxFileSize,
  };

  return multer({ storage, fileFilter, limits });
}

export function validateFileType(fileType: string): boolean {
  const allowedTypes = systemConfig.uploads.allowedTypes;
  return allowedTypes.includes(fileType);
}

export function validateFileSize(fileSize: number): boolean {
  const maxSize = systemConfig.uploads.maxFileSize;
  return fileSize <= maxSize;
}

export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}

export function deleteFile(filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const filePath = path.join(systemConfig.uploads.uploadDir, filename);
    
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}