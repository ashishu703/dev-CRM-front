import apiClient from '../../utils/apiClient';

class ConfigurationService {
  // Get all configurations
  async getAll() {
    try {
      const response = await apiClient.get('/api/configuration');
      return response;
    } catch (error) {
      console.error('Error fetching configurations:', error);
      throw error;
    }
  }

  // Save email configuration
  async saveEmail(config) {
    try {
      const response = await apiClient.post('/api/configuration/email', config);
      return response;
    } catch (error) {
      console.error('Error saving email configuration:', error);
      throw error;
    }
  }

  // Save WhatsApp configuration
  async saveWhatsApp(config) {
    try {
      const response = await apiClient.post('/api/configuration/whatsapp', config);
      return response;
    } catch (error) {
      console.error('Error saving WhatsApp configuration:', error);
      throw error;
    }
  }

  // Save Cloudinary configuration
  async saveCloudinary(config) {
    try {
      const response = await apiClient.post('/api/configuration/cloudinary', config);
      return response;
    } catch (error) {
      console.error('Error saving Cloudinary configuration:', error);
      throw error;
    }
  }

  // Save Indiamart configuration
  async saveIndiamart(config) {
    try {
      const response = await apiClient.post('/api/configuration/indiamart', config);
      return response;
    } catch (error) {
      console.error('Error saving Indiamart configuration:', error);
      throw error;
    }
  }

  // Save TradeIndia configuration
  async saveTradeIndia(config) {
    try {
      const response = await apiClient.post('/api/configuration/tradeindia', config);
      return response;
    } catch (error) {
      console.error('Error saving TradeIndia configuration:', error);
      throw error;
    }
  }

  // Get global settings
  async getGlobalSettings() {
    try {
      const response = await apiClient.get('/api/configuration/global');
      return response;
    } catch (error) {
      console.error('Error fetching global settings:', error);
      throw error;
    }
  }

  // Set global setting
  async setGlobalSetting(key, value, description = null) {
    try {
      const response = await apiClient.post('/api/configuration/global', {
        key,
        value,
        description
      });
      return response;
    } catch (error) {
      console.error('Error setting global setting:', error);
      throw error;
    }
  }

  // Get email templates
  async getEmailTemplates() {
    try {
      const response = await apiClient.get('/api/configuration/templates');
      return response;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  // Create email template
  async createEmailTemplate(template) {
    try {
      const response = await apiClient.post('/api/configuration/templates', template);
      return response;
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  // Update email template
  async updateEmailTemplate(id, template) {
    try {
      const response = await apiClient.put(`/api/configuration/templates/${id}`, template);
      return response;
    } catch (error) {
      console.error('Error updating email template:', error);
      throw error;
    }
  }

  // Delete email template
  async deleteEmailTemplate(id) {
    try {
      const response = await apiClient.delete(`/api/configuration/templates/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  }

  // Get document templates (optionally filtered by type)
  async getDocumentTemplates(templateType) {
    try {
      const query = templateType ? `?type=${encodeURIComponent(templateType)}` : '';
      const response = await apiClient.get(`/api/configuration/document-templates${query}`);
      return response;
    } catch (error) {
      console.error('Error fetching document templates:', error);
      throw error;
    }
  }

  // Create document template
  async createDocumentTemplate(template) {
    try {
      const response = await apiClient.post('/api/configuration/document-templates', template);
      return response;
    } catch (error) {
      console.error('Error creating document template:', error);
      throw error;
    }
  }

  // Update document template
  async updateDocumentTemplate(id, template) {
    try {
      const response = await apiClient.put(`/api/configuration/document-templates/${id}`, template);
      return response;
    } catch (error) {
      console.error('Error updating document template:', error);
      throw error;
    }
  }

  // Delete document template
  async deleteDocumentTemplate(id) {
    try {
      const response = await apiClient.delete(`/api/configuration/document-templates/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting document template:', error);
      throw error;
    }
  }

  // Get push notification configuration
  async getPushNotificationConfig() {
    try {
      const response = await apiClient.get('/api/configuration/push-notification');
      return response;
    } catch (error) {
      console.error('Error fetching push notification config:', error);
      throw error;
    }
  }

  // Save push notification configuration
  async savePushNotificationConfig(config) {
    try {
      const response = await apiClient.post('/api/configuration/push-notification', config);
      return response;
    } catch (error) {
      console.error('Error saving push notification config:', error);
      throw error;
    }
  }

  // Get public VAPID key
  async getPublicVapidKey() {
    try {
      const response = await apiClient.get('/api/configuration/push-notification/vapid-key');
      return response;
    } catch (error) {
      console.error('Error fetching VAPID key:', error);
      throw error;
    }
  }
}

export default new ConfigurationService();

