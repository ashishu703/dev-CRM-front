import configurationService from '../api/admin_api/configurationService';

class TemplateService {
  async getTemplatesByType(templateType) {
    const response = await configurationService.getDocumentTemplates(templateType);
    if (!response?.success) {
      throw new Error('Failed to fetch document templates');
    }
    return Array.isArray(response.data) ? response.data : [];
  }

  async getTemplateByTypeAndKey(templateType, templateKey) {
    if (!templateType || !templateKey) {
      throw new Error('templateType and templateKey are required');
    }
    
    const templates = await this.getTemplatesByType(templateType);
    const foundTemplate = templates.find((tpl) => tpl.template_key === templateKey);
    
    return foundTemplate || null;
  }
}

export default new TemplateService();

