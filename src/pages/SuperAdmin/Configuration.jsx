import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Mail, 
  MessageSquare, 
  Save, 
  TestTube, 
  Eye, 
  Settings,
  Lock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Cloud,
  Key,
  Loader,
  Plus,
  X,
  Bell
} from 'lucide-react';
import configurationService from '../../api/admin_api/configurationService';
import TemplateFormSidebar from '../../components/TemplateFormSidebar';
import EmailTemplateFormSidebar from '../../components/EmailTemplateFormSidebar';
import { SkeletonCard } from '../../components/dashboard/DashboardSkeleton';

const Configuration = () => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [showEmailTemplateSidebar, setShowEmailTemplateSidebar] = useState(false);
  const [showDocumentTemplateSidebar, setShowDocumentTemplateSidebar] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    description: '',
    content: null,
    htmlContent: ''
  });

  // SMTP Settings State
  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    fromName: '',
    fromEmail: '',
    recipients: '',
    ccRecipients: '',
    bccRecipients: ''
  });

  // WhatsApp Settings State
  const [whatsappSettings, setWhatsappSettings] = useState({
    flowId: '',
    flowName: '',
    apiKey: '',
    phoneNumber: ''
  });

  // Cloudinary Settings State
  const [cloudinarySettings, setCloudinarySettings] = useState({
    cloudName: '',
    apiKey: '',
    apiSecret: '',
    uploadPreset: '',
    folder: ''
  });

  // Indiamart Settings State
  const [indiamartSettings, setIndiamartSettings] = useState({
    apiKey: '',
    apiSecret: '',
    accessToken: '',
    refreshToken: '',
    tokenExpiresAt: '',
    webhookUrl: ''
  });

  // TradeIndia Settings State
  const [tradeindiaSettings, setTradeindiaSettings] = useState({
    apiKey: '',
    apiSecret: '',
    accessToken: '',
    refreshToken: '',
    tokenExpiresAt: '',
    webhookUrl: ''
  });

  // Push Notification Settings State
  const [pushNotificationSettings, setPushNotificationSettings] = useState({
    firebase_project_id: '',
    firebase_client_email: '',
    firebase_private_key: '',
    firebase_messaging_sender_id: '',
    firebase_app_id: '',
    firebase_public_vapid_key: '',
    notification_enabled: false
  });

  // Templates State
  const [templates, setTemplates] = useState([]);
  const [documentTemplates, setDocumentTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingDocumentTemplateId, setEditingDocumentTemplateId] = useState(null);
  const [documentTemplateForm, setDocumentTemplateForm] = useState({
    templateType: 'quotation',
    name: '',
    templateKey: '',
    description: '',
    htmlContent: '',
    isDefault: false,
    isActive: true
  });

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const response = await configurationService.getAll();
      if (response.success) {
        const {
          email,
          whatsapp,
          cloudinary,
          indiamart,
          tradeindia,
          templates: emailTemplates,
          documentTemplates: loadedDocumentTemplates
        } = response.data;
        
        if (email) {
          setSmtpSettings({
            host: email.host || '',
            port: email.port || '',
            username: email.username || '',
            password: email.password || '',
            fromName: email.from_name || '',
            fromEmail: email.from_email || '',
            recipients: email.recipients || '',
            ccRecipients: email.cc_recipients || '',
            bccRecipients: email.bcc_recipients || ''
          });
        }
        
        if (whatsapp) {
          setWhatsappSettings({
            flowId: whatsapp.flow_id || '',
            flowName: whatsapp.flow_name || '',
            apiKey: whatsapp.api_key || '',
            phoneNumber: whatsapp.phone_number || ''
          });
        }
        
        if (cloudinary) {
          setCloudinarySettings({
            cloudName: cloudinary.cloud_name || '',
            apiKey: cloudinary.api_key || '',
            apiSecret: cloudinary.api_secret || '',
            uploadPreset: cloudinary.upload_preset || '',
            folder: cloudinary.default_folder || ''
          });
        }
        
        if (indiamart) {
          setIndiamartSettings({
            apiKey: indiamart.api_key || '',
            apiSecret: indiamart.api_secret || '',
            accessToken: indiamart.access_token || '',
            refreshToken: indiamart.refresh_token || '',
            tokenExpiresAt: indiamart.token_expires_at || '',
            webhookUrl: indiamart.webhook_url || ''
          });
        }
        
        if (tradeindia) {
          setTradeindiaSettings({
            apiKey: tradeindia.api_key || '',
            apiSecret: tradeindia.api_secret || '',
            accessToken: tradeindia.access_token || '',
            refreshToken: tradeindia.refresh_token || '',
            tokenExpiresAt: tradeindia.token_expires_at || '',
            webhookUrl: tradeindia.webhook_url || ''
          });
        }
        
        if (emailTemplates) {
          setTemplates(emailTemplates);
        }

        if (loadedDocumentTemplates) {
          setDocumentTemplates(loadedDocumentTemplates);
        }
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      setMessage({ type: 'error', text: 'Failed to load configurations' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSmtpChange = (field, value) => {
    setSmtpSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWhatsappChange = (field, value) => {
    setWhatsappSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloudinaryChange = (field, value) => {
    setCloudinarySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIndiamartChange = (field, value) => {
    setIndiamartSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTradeIndiaChange = (field, value) => {
    setTradeindiaSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePushNotificationChange = (field, value) => {
    setPushNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateChange = (field, value) => {
    setTemplateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentTemplateChange = (field, value) => {
    setDocumentTemplateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const resetDocumentTemplateForm = () => {
    setEditingDocumentTemplateId(null);
    setDocumentTemplateForm({
      templateType: 'quotation',
      name: '',
      templateKey: '',
      description: '',
      htmlContent: '',
      isDefault: false,
      isActive: true
    });
    setShowDocumentTemplateSidebar(false);
  };

  const handleOpenDocumentTemplateSidebar = () => {
    resetDocumentTemplateForm();
    setShowDocumentTemplateSidebar(true);
  };

  const handleOpenEmailTemplateSidebar = () => {
    setTemplateForm({ name: '', subject: '', description: '', content: null, htmlContent: '' });
    setShowEmailTemplateSidebar(true);
  };

  const handleCancelEmailTemplate = () => {
    setTemplateForm({ name: '', subject: '', description: '', content: null, htmlContent: '' });
    setShowEmailTemplateSidebar(false);
  };

  const handleSaveEmailTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.htmlContent) {
      showMessage('error', 'Please fill all required fields');
      return;
    }
    
    setSaving(true);
    try {
      const response = await configurationService.createEmailTemplate({
        name: templateForm.name,
        subject: templateForm.subject,
        description: templateForm.description,
        htmlContent: templateForm.htmlContent
      });
      
      if (response.success) {
        showMessage('success', 'Template created successfully');
        setTemplateForm({ name: '', subject: '', description: '', content: null, htmlContent: '' });
        setShowEmailTemplateSidebar(false);
        loadConfigurations();
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDocumentTemplate = async () => {
    const { templateType, name, templateKey } = documentTemplateForm;

    if (!templateType || !name || !templateKey) {
      showMessage('error', 'Template type, name and key are required');
      return;
    }

    setSaving(true);
    try {
      if (editingDocumentTemplateId) {
        const response = await configurationService.updateDocumentTemplate(
          editingDocumentTemplateId,
          documentTemplateForm
        );
        if (response.success && response.data) {
          const updated = documentTemplates.map(template =>
            template.id === response.data.id ? response.data : template
          );
          setDocumentTemplates(updated);
          showMessage('success', 'Document template updated successfully');
        }
      } else {
        const response = await configurationService.createDocumentTemplate(documentTemplateForm);
        if (response.success && response.data) {
          setDocumentTemplates([response.data, ...documentTemplates]);
          showMessage('success', 'Document template created successfully');
        }
      }

      resetDocumentTemplateForm();
    } catch (error) {
      const text = error?.message || 'Failed to save document template';
      showMessage('error', text);
    } finally {
      setSaving(false);
    }
  };


  const handleEditDocumentTemplate = (template) => {
    setEditingDocumentTemplateId(template.id);
    setDocumentTemplateForm({
      templateType: template.template_type,
      name: template.name,
      templateKey: template.template_key,
      description: template.description || '',
      htmlContent: template.html_content || '',
      isDefault: Boolean(template.is_default),
      isActive: Boolean(template.is_active)
    });
    setShowDocumentTemplateSidebar(true);
  };

  const handleDeleteDocumentTemplate = async (id) => {
    setSaving(true);
    try {
      const response = await configurationService.deleteDocumentTemplate(id);
      if (response.success) {
        const remaining = documentTemplates.filter(template => template.id !== id);
        setDocumentTemplates(remaining);
        if (editingDocumentTemplateId === id) {
          resetDocumentTemplateForm();
        }
        showMessage('success', 'Document template deleted successfully');
      }
    } catch (error) {
      const text = error?.message || 'Failed to delete document template';
      showMessage('error', text);
    } finally {
      setSaving(false);
    }
  };


  const handleTestSmtp = async () => {
    // Test SMTP configuration
    setSaving(true);
    try {
      // TODO: Implement SMTP test functionality
      showMessage('success', 'SMTP test functionality will be implemented soon');
    } catch (error) {
      showMessage('error', error.message || 'Failed to test SMTP configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmtp = async () => {
    setSaving(true);
    try {
      const response = await configurationService.saveEmail({
        host: smtpSettings.host,
        port: parseInt(smtpSettings.port),
        username: smtpSettings.username,
        password: smtpSettings.password,
        fromName: smtpSettings.fromName,
        fromEmail: smtpSettings.fromEmail,
        recipients: smtpSettings.recipients,
        ccRecipients: smtpSettings.ccRecipients,
        bccRecipients: smtpSettings.bccRecipients
      });
      
      if (response.success) {
        showMessage('success', 'SMTP configuration saved successfully');
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to save SMTP configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWhatsapp = async () => {
    setSaving(true);
    try {
      const response = await configurationService.saveWhatsApp({
        flowId: whatsappSettings.flowId,
        flowName: whatsappSettings.flowName,
        apiKey: whatsappSettings.apiKey,
        phoneNumber: whatsappSettings.phoneNumber
      });
      
      if (response.success) {
        showMessage('success', 'WhatsApp configuration saved successfully');
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to save WhatsApp configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCloudinary = async () => {
    setSaving(true);
    try {
      const response = await configurationService.saveCloudinary({
        cloudName: cloudinarySettings.cloudName,
        apiKey: cloudinarySettings.apiKey,
        apiSecret: cloudinarySettings.apiSecret,
        uploadPreset: cloudinarySettings.uploadPreset,
        folder: cloudinarySettings.folder
      });
      
      if (response.success) {
        showMessage('success', 'Cloudinary configuration saved successfully');
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to save Cloudinary configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIndiamart = async () => {
    setSaving(true);
    try {
      const response = await configurationService.saveIndiamart({
        apiKey: indiamartSettings.apiKey,
        apiSecret: indiamartSettings.apiSecret,
        accessToken: indiamartSettings.accessToken,
        refreshToken: indiamartSettings.refreshToken,
        tokenExpiresAt: indiamartSettings.tokenExpiresAt || null,
        webhookUrl: indiamartSettings.webhookUrl
      });
      
      if (response.success) {
        showMessage('success', 'Indiamart configuration saved successfully');
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to save Indiamart configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePushNotification = async () => {
    if (!pushNotificationSettings.firebase_project_id || 
        !pushNotificationSettings.firebase_client_email || 
        !pushNotificationSettings.firebase_private_key ||
        !pushNotificationSettings.firebase_messaging_sender_id ||
        !pushNotificationSettings.firebase_app_id ||
        !pushNotificationSettings.firebase_public_vapid_key) {
      showMessage('error', 'All Firebase configuration fields are required');
      return;
    }

    setSaving(true);
    try {
      const response = await configurationService.savePushNotificationConfig({
        firebase_project_id: pushNotificationSettings.firebase_project_id,
        firebase_client_email: pushNotificationSettings.firebase_client_email,
        firebase_private_key: pushNotificationSettings.firebase_private_key,
        firebase_messaging_sender_id: pushNotificationSettings.firebase_messaging_sender_id,
        firebase_app_id: pushNotificationSettings.firebase_app_id,
        firebase_public_vapid_key: pushNotificationSettings.firebase_public_vapid_key,
        notification_enabled: pushNotificationSettings.notification_enabled
      });
      
      if (response.success) {
        showMessage('success', 'Push notification configuration saved successfully');
        loadConfigurations();
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to save push notification configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTradeIndia = async () => {
    setSaving(true);
    try {
      const response = await configurationService.saveTradeIndia({
        apiKey: tradeindiaSettings.apiKey,
        apiSecret: tradeindiaSettings.apiSecret,
        accessToken: tradeindiaSettings.accessToken,
        refreshToken: tradeindiaSettings.refreshToken,
        tokenExpiresAt: tradeindiaSettings.tokenExpiresAt || null,
        webhookUrl: tradeindiaSettings.webhookUrl
      });
      
      if (response.success) {
        showMessage('success', 'TradeIndia configuration saved successfully');
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to save TradeIndia configuration');
    } finally {
      setSaving(false);
    }
  };

  const renderSmtpSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-xl border border-blue-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3 shadow-lg">
            <Server className="w-6 h-6 text-white" />
          </div>
          Server Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={smtpSettings.host}
              onChange={(e) => handleSmtpChange('host', e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={smtpSettings.port}
              onChange={(e) => handleSmtpChange('port', e.target.value)}
              placeholder="587"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl border border-green-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3 shadow-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          Authentication
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={smtpSettings.username}
              onChange={(e) => handleSmtpChange('username', e.target.value)}
              placeholder="your-email@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={smtpSettings.password}
              onChange={(e) => handleSmtpChange('password', e.target.value)}
              placeholder="Your app password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-xl border border-purple-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.1), 0 10px 10px -5px rgba(168, 85, 247, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          Recipients
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={smtpSettings.fromName}
              onChange={(e) => handleSmtpChange('fromName', e.target.value)}
              placeholder="Your Company Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={smtpSettings.fromEmail}
              onChange={(e) => handleSmtpChange('fromEmail', e.target.value)}
              placeholder="noreply@yourcompany.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <input
                type="text"
                value={smtpSettings.recipients}
                onChange={(e) => handleSmtpChange('recipients', e.target.value)}
                placeholder="user1@example.com, user2@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CC Recipients
              </label>
              <input
                type="text"
                value={smtpSettings.ccRecipients}
                onChange={(e) => handleSmtpChange('ccRecipients', e.target.value)}
                placeholder="cc@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BCC Recipients
              </label>
              <input
                type="text"
                value={smtpSettings.bccRecipients}
                onChange={(e) => handleSmtpChange('bccRecipients', e.target.value)}
                placeholder="bcc@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleTestSmtp}
          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center space-x-2"
        >
          <TestTube className="w-4 h-4" />
          <span>Test Config</span>
        </button>
        <button
          onClick={handleSaveSmtp}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          style={{
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Config'}</span>
        </button>
      </div>
    </div>
  );

  const renderEmailTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
        <button
          onClick={handleOpenEmailTemplateSidebar}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No email templates found. Create your first template to get started.
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {template.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {template.subject}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {template.description}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {template.createdAt}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDocumentTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Document Templates
        </h3>
        <button
          onClick={handleOpenDocumentTemplateSidebar}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden" style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Type
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Name
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {documentTemplates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No document templates found. Create your first template to get started.
                  </td>
                </tr>
              ) : (
                documentTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                    <td className="px-4 py-4 text-sm text-gray-900 capitalize">
                      {template.template_type}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {template.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {template.template_key}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {template.is_default ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {template.is_active ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {template.created_at}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditDocumentTemplate(template)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit Template"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocumentTemplate(template.id)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          title="Delete Template"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWhatsappSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl border border-green-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mr-3 shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          WhatsApp Configuration
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Flow <span className="text-red-500">*</span>
              </label>
              <select
                value={whatsappSettings.flowName}
                onChange={(e) => handleWhatsappChange('flowName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Flow</option>
                <option value="welcome-flow">Welcome Flow</option>
                <option value="follow-up-flow">Follow-up Flow</option>
                <option value="payment-reminder">Payment Reminder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flow ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={whatsappSettings.flowId}
                onChange={(e) => handleWhatsappChange('flowId', e.target.value)}
                placeholder="Enter Flow ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={whatsappSettings.apiKey}
                onChange={(e) => handleWhatsappChange('apiKey', e.target.value)}
                placeholder="Enter WhatsApp API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={whatsappSettings.phoneNumber}
                onChange={(e) => handleWhatsappChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveWhatsapp}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          style={{
            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Config'}</span>
        </button>
      </div>
    </div>
  );

  const renderIndiamartSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-xl border border-orange-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.1), 0 10px 10px -5px rgba(249, 115, 22, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mr-3 shadow-lg">
            <Key className="w-6 h-6 text-white" />
          </div>
          Indiamart API Configuration
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={indiamartSettings.apiKey}
                onChange={(e) => handleIndiamartChange('apiKey', e.target.value)}
                placeholder="Enter Indiamart API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={indiamartSettings.apiSecret}
                onChange={(e) => handleIndiamartChange('apiSecret', e.target.value)}
                placeholder="Enter Indiamart API Secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token
              </label>
              <input
                type="password"
                value={indiamartSettings.accessToken}
                onChange={(e) => handleIndiamartChange('accessToken', e.target.value)}
                placeholder="Access Token (auto-generated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Token
              </label>
              <input
                type="password"
                value={indiamartSettings.refreshToken}
                onChange={(e) => handleIndiamartChange('refreshToken', e.target.value)}
                placeholder="Refresh Token (auto-generated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Expires At
              </label>
              <input
                type="datetime-local"
                value={indiamartSettings.tokenExpiresAt}
                onChange={(e) => handleIndiamartChange('tokenExpiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={indiamartSettings.webhookUrl}
                onChange={(e) => handleIndiamartChange('webhookUrl', e.target.value)}
                placeholder="https://your-domain.com/webhook/indiamart"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveIndiamart}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          style={{
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Config'}</span>
        </button>
      </div>
    </div>
  );

  const renderTradeIndiaSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-cyan-50/30 rounded-2xl shadow-xl border border-cyan-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.1), 0 10px 10px -5px rgba(6, 182, 212, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-3 shadow-lg">
            <Key className="w-6 h-6 text-white" />
          </div>
          TradeIndia API Configuration
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={tradeindiaSettings.apiKey}
                onChange={(e) => handleTradeIndiaChange('apiKey', e.target.value)}
                placeholder="Enter TradeIndia API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={tradeindiaSettings.apiSecret}
                onChange={(e) => handleTradeIndiaChange('apiSecret', e.target.value)}
                placeholder="Enter TradeIndia API Secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token
              </label>
              <input
                type="password"
                value={tradeindiaSettings.accessToken}
                onChange={(e) => handleTradeIndiaChange('accessToken', e.target.value)}
                placeholder="Access Token (auto-generated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refresh Token
              </label>
              <input
                type="password"
                value={tradeindiaSettings.refreshToken}
                onChange={(e) => handleTradeIndiaChange('refreshToken', e.target.value)}
                placeholder="Refresh Token (auto-generated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Expires At
              </label>
              <input
                type="datetime-local"
                value={tradeindiaSettings.tokenExpiresAt}
                onChange={(e) => handleTradeIndiaChange('tokenExpiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={tradeindiaSettings.webhookUrl}
                onChange={(e) => handleTradeIndiaChange('webhookUrl', e.target.value)}
                placeholder="https://your-domain.com/webhook/tradeindia"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveTradeIndia}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          style={{
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Config'}</span>
        </button>
      </div>
    </div>
  );

  const renderPushNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-pink-50/30 rounded-2xl shadow-xl border border-pink-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mr-3 shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          Firebase Push Notification Configuration
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="notification_enabled"
              checked={pushNotificationSettings.notification_enabled}
              onChange={(e) => handlePushNotificationChange('notification_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notification_enabled" className="text-sm font-medium text-gray-700">
              Enable Push Notifications
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firebase Project ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pushNotificationSettings.firebase_project_id}
                onChange={(e) => handlePushNotificationChange('firebase_project_id', e.target.value)}
                placeholder="your-project-id"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firebase Client Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={pushNotificationSettings.firebase_client_email}
                onChange={(e) => handlePushNotificationChange('firebase_client_email', e.target.value)}
                placeholder="firebase-adminsdk@your-project.iam.gserviceaccount.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firebase Private Key <span className="text-red-500">*</span>
            </label>
            <textarea
              value={pushNotificationSettings.firebase_private_key}
              onChange={(e) => handlePushNotificationChange('firebase_private_key', e.target.value)}
              placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firebase Messaging Sender ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pushNotificationSettings.firebase_messaging_sender_id}
                onChange={(e) => handlePushNotificationChange('firebase_messaging_sender_id', e.target.value)}
                placeholder="123456789012"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firebase App ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pushNotificationSettings.firebase_app_id}
                onChange={(e) => handlePushNotificationChange('firebase_app_id', e.target.value)}
                placeholder="1:123456789012:web:abcdef123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firebase Public VAPID Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pushNotificationSettings.firebase_public_vapid_key}
              onChange={(e) => handlePushNotificationChange('firebase_public_vapid_key', e.target.value)}
              placeholder="BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSavePushNotification}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          style={{
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );

  const renderCloudinarySettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-xl border border-indigo-100/50 p-6" style={{
        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          Cloudinary Configuration
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloud Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cloudinarySettings.cloudName}
                onChange={(e) => handleCloudinaryChange('cloudName', e.target.value)}
                placeholder="your-cloud-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cloudinarySettings.apiKey}
                onChange={(e) => handleCloudinaryChange('apiKey', e.target.value)}
                placeholder="Enter API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={cloudinarySettings.apiSecret}
                onChange={(e) => handleCloudinaryChange('apiSecret', e.target.value)}
                placeholder="Enter API Secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Preset
              </label>
              <input
                type="text"
                value={cloudinarySettings.uploadPreset}
                onChange={(e) => handleCloudinaryChange('uploadPreset', e.target.value)}
                placeholder="Enter Upload Preset (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Folder
            </label>
            <input
              type="text"
              value={cloudinarySettings.folder}
              onChange={(e) => handleCloudinaryChange('folder', e.target.value)}
              placeholder="folder-name (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Optional: Default folder path for uploads</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveCloudinary}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          style={{
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Config'}</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      backgroundAttachment: 'fixed'
    }}>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-xl flex items-center space-x-2 shadow-lg ${
          message.type === 'success' 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300' 
            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300'
        }`} style={{
          boxShadow: message.type === 'success' 
            ? '0 4px 6px -1px rgba(34, 197, 94, 0.2)' 
            : '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
        }}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 mb-6" style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="border-b-2 border-gray-200">
          <nav className="flex space-x-2 px-4 overflow-x-auto">
            {[
              { id: 'smtp', label: 'SMTP Settings', icon: Server, color: 'from-blue-500 to-cyan-500' },
              { id: 'templates', label: 'Email Templates', icon: Mail, color: 'from-purple-500 to-pink-500' },
              { id: 'documentTemplates', label: 'Document Templates', icon: FileText, color: 'from-green-500 to-emerald-500' },
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'from-green-500 to-teal-500' },
              { id: 'cloudinary', label: 'File Upload', icon: Cloud, color: 'from-indigo-500 to-purple-500' },
              { id: 'indiamart', label: 'Indiamart', icon: Key, color: 'from-orange-500 to-amber-500' },
              { id: 'tradeindia', label: 'TradeIndia', icon: Key, color: 'from-cyan-500 to-blue-500' },
              { id: 'pushNotification', label: 'Push Notifications', icon: Bell, color: 'from-pink-500 to-rose-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-3 font-semibold text-sm flex items-center space-x-2 transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-transparent bg-gradient-to-t from-${tab.color.split(' ')[1]}-50 to-transparent text-${tab.color.split(' ')[1].split('-')[0]}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  borderBottomColor: activeTab === tab.id ? undefined : 'transparent',
                  borderBottomWidth: activeTab === tab.id ? '3px' : '2px'
                }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === tab.id 
                    ? `bg-gradient-to-br ${tab.color}` 
                    : 'bg-gray-200'
                }`}>
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'smtp' && renderSmtpSettings()}
          {activeTab === 'templates' && renderEmailTemplates()}
          {activeTab === 'documentTemplates' && renderDocumentTemplates()}
          {activeTab === 'whatsapp' && renderWhatsappSettings()}
          {activeTab === 'cloudinary' && renderCloudinarySettings()}
          {activeTab === 'indiamart' && renderIndiamartSettings()}
          {activeTab === 'tradeindia' && renderTradeIndiaSettings()}
          {activeTab === 'pushNotification' && renderPushNotificationSettings()}
        </div>
      </div>

      {/* Document Template Sidebar */}
      <TemplateFormSidebar
        isOpen={showDocumentTemplateSidebar}
        onClose={() => {
          resetDocumentTemplateForm();
        }}
        formData={documentTemplateForm}
        onFormChange={handleDocumentTemplateChange}
        onSave={handleSaveDocumentTemplate}
        onClear={resetDocumentTemplateForm}
        saving={saving}
        isEditing={!!editingDocumentTemplateId}
      />

      {/* Email Template Sidebar */}
      <EmailTemplateFormSidebar
        isOpen={showEmailTemplateSidebar}
        onClose={handleCancelEmailTemplate}
        formData={templateForm}
        onFormChange={handleTemplateChange}
        onSave={handleSaveEmailTemplate}
        onCancel={handleCancelEmailTemplate}
        saving={saving}
      />
    </div>
  );
};

export default Configuration;
