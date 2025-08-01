import fs from 'fs';
import path from 'path';

export const createUploadsDir = () => {
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

export const cleanupOldFiles = async (maxAge = 24 * 60 * 60 * 1000) => {
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  try {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
};

export const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};