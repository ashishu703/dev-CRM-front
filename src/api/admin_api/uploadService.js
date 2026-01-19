import apiClient from '../../utils/apiClient';

class UploadService {
  /**
   * Upload single file to Cloudinary
   * @param {File} file - File to upload
   * @param {string} folder - Optional folder name
   * @returns {Promise<string>} URL of uploaded file
   */
  async uploadFile(file, folder = 'payments') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/upload?folder=${folder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files to upload
   * @param {string} folder - Optional folder name
   * @returns {Promise<string[]>} Array of URLs
   */
  async uploadMultipleFiles(files, folder = 'payments') {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/upload/multiple?folder=${folder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      return data.data.map(item => item.url);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }
}

export default new UploadService();

