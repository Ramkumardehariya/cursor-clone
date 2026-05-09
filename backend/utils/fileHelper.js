/**
 * File system helper utilities
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileHelper {
  /**
   * Ensure directory exists
   * @param {string} dirPath - Directory path
   */
  static async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path
   * @returns {boolean} True if file exists
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Read file content
   * @param {string} filePath - File path
   * @returns {string} File content
   */
  static async readFile(filePath) {
    return await fs.readFile(filePath, 'utf8');
  }

  /**
   * Write file content
   * @param {string} filePath - File path
   * @param {string} content - File content
   */
  static async writeFile(filePath, content) {
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * Delete file
   * @param {string} filePath - File path
   */
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore error
    }
  }

  /**
   * Get file stats
   * @param {string} filePath - File path
   * @returns {Object} File stats
   */
  static async getFileStats(filePath) {
    return await fs.stat(filePath);
  }

  /**
   * Get file extension
   * @param {string} filename - Filename
   * @returns {string} File extension
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase().slice(1);
  }

  /**
   * Get file name without extension
   * @param {string} filename - Filename
   * @returns {string} Filename without extension
   */
  static getFileName(filename) {
    return path.basename(filename, path.extname(filename));
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @returns {string} Unique filename
   */
  static generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${name}_${timestamp}_${random}${ext}`;
  }

  /**
   * Get MIME type based on file extension
   * @param {string} filename - Filename
   * @returns {string} MIME type
   */
  static getMimeType(filename) {
    const ext = this.getFileExtension(filename);
    const mimeTypes = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'ico': 'image/x-icon',
      
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Text files
      'txt': 'text/plain',
      'md': 'text/markdown',
      'json': 'application/json',
      'xml': 'application/xml',
      'yaml': 'text/yaml',
      'yml': 'text/yaml',
      'csv': 'text/csv',
      
      // Code files
      'js': 'text/javascript',
      'jsx': 'text/javascript',
      'ts': 'text/typescript',
      'tsx': 'text/typescript',
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'scss': 'text/x-scss',
      'sass': 'text/x-sass',
      'less': 'text/x-less',
      'py': 'text/x-python',
      'java': 'text/x-java-source',
      'c': 'text/x-c',
      'cpp': 'text/x-c++',
      'cs': 'text/x-csharp',
      'php': 'text/x-php',
      'rb': 'text/x-ruby',
      'go': 'text/x-go',
      'rs': 'text/x-rust',
      'swift': 'text/x-swift',
      'dart': 'text/x-dart',
      'sql': 'text/x-sql',
      'sh': 'text/x-shellscript',
      'bash': 'text/x-shellscript',
      
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      
      // Default
      'default': 'application/octet-stream'
    };
    
    return mimeTypes[ext] || mimeTypes.default;
  }

  /**
   * Check if file is an image
   * @param {string} filename - Filename
   * @returns {boolean} True if image
   */
  static isImage(filename) {
    const ext = this.getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'].includes(ext);
  }

  /**
   * Check if file is a code file
   * @param {string} filename - Filename
   * @returns {boolean} True if code file
   */
  static isCodeFile(filename) {
    const ext = this.getFileExtension(filename);
    return [
      'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
      'html', 'htm', 'css', 'scss', 'sass', 'less',
      'json', 'xml', 'yaml', 'yml', 'toml', 'ini',
      'py', 'pyx', 'pyi', 'ipynb',
      'java', 'kt', 'scala', 'groovy',
      'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'hxx',
      'cs', 'vb', 'fs', 'fsx',
      'php', 'phtml', 'php3', 'php4', 'php5',
      'rb', 'rbw', 'gemspec',
      'go', 'mod', 'sum',
      'rs', 'rlib',
      'swift', 'm', 'mm',
      'dart', 'sql', 'sh', 'bash', 'zsh', 'fish',
      'md', 'markdown', 'txt', 'log',
      'dockerfile', 'docker-compose', 'makefile', 'cmake'
    ].includes(ext);
  }

  /**
   * Get file size in human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Human readable file size
   */
  static formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Calculate file hash
   * @param {string} filePath - File path
   * @returns {string} SHA256 hash
   */
  static async calculateHash(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Create file backup
   * @param {string} filePath - Original file path
   * @returns {string} Backup file path
   */
  static async createBackup(filePath) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  }
}

module.exports = FileHelper;
