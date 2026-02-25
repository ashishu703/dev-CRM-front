import React, { useState, useCallback } from 'react';
import { X, Send, Settings, Paperclip } from 'lucide-react';
import { useGetEmailConfigQuery, useSaveEmailConfigMutation, useSendEmailMutation } from '../../features/email/emailApi';
import Toast from '../../utils/Toast';

export default function SendEmailForm({ customer, onClose, isDarkMode = false }) {
  const [showSetup, setShowSetup] = useState(false);
  const [toEmail, setToEmail] = useState(customer?.email || '');
  const [cc, setCc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [bcc, setBcc] = useState('');
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const fileInputRef = React.useRef(null);

  const { data: configData, isLoading: loadingConfig } = useGetEmailConfigQuery(undefined);
  const [saveConfig, { isLoading: savingConfig }] = useSaveEmailConfigMutation();
  const [sendEmail, { isLoading: sending }] = useSendEmailMutation();

  const config = configData?.data ?? null;

  React.useEffect(() => {
    setToEmail(customer?.email || '');
  }, [customer?.email]);

  React.useEffect(() => {
    if (config) {
      setSubject(config.defaultSubject || '');
      setBody(config.defaultBody || '');
      if (showSetup) {
        setSmtpHost(config.smtpHost || '');
        setSmtpPort(String(config.smtpPort || '587'));
        setSmtpUser(config.smtpUser || '');
        setFromEmail(config.fromEmail || '');
      }
    }
  }, [config, showSetup]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const add = files.map((f) => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => resolve({ filename: f.name, content: reader.result.split(',')[1] });
        reader.readAsDataURL(f);
      });
    });
    Promise.all(add).then((arr) => setAttachments((prev) => [...prev, ...arr]));
  }, []);

  const removeAttachment = useCallback((i) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await saveConfig({
        smtpHost,
        smtpPort: parseInt(smtpPort, 10) || 587,
        smtpUser,
        smtpPass,
        fromEmail,
        defaultSubject: subject,
        defaultBody: body,
      }).unwrap();
      Toast.success('Email config saved');
      setShowSetup(false);
    } catch (err) {
      Toast.error(err?.data?.message || 'Failed to save config');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toEmail?.trim()) {
      Toast.warning('Recipient email required');
      return;
    }
    try {
      await sendEmail({
        to: toEmail.trim(),
        cc: cc.trim() ? cc.trim().split(/[\s,;]+/).filter(Boolean) : undefined,
        bcc: bcc.trim() ? bcc.trim().split(/[\s,;]+/).filter(Boolean) : undefined,
        subject: subject || 'Message from ANOCAB',
        text: body,
        html: body.replace(/\n/g, '<br/>'),
        leadId: customer?.id ?? customer?._id,
        customerId: customer?.id ?? customer?._id,
        customerName: customer?.name,
        customerEmail: toEmail,
        attachments: attachments.length ? attachments : undefined,
      }).unwrap();
      Toast.success('Email sent and saved');
      setSubject('');
      setBody('');
      setAttachments([]);
      setCc('');
      setBcc('');
      onClose?.();
    } catch (err) {
      Toast.error(err?.data?.message || err?.error?.message || 'Failed to send email. Configure your email first.');
    }
  };

  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`;
  const btnCls = `px-4 py-2 rounded-lg font-medium text-sm transition-colors`;

  if (loadingConfig && showSetup) {
    return (
      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-slate-200'}`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>Loading config...</p>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-base font-bold ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>Email Setup</h3>
          <button type="button" onClick={() => setShowSetup(false)} className="p-1.5 rounded-lg hover:bg-black/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSaveConfig} className="space-y-3">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>SMTP Host</label>
            <input className={inputCls} value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" required />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>SMTP Port</label>
            <input className={inputCls} type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>SMTP User</label>
            <input className={inputCls} type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>SMTP Password</label>
            <input className={inputCls} type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="App password" />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>From Email</label>
            <input className={inputCls} type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="from@email.com" required />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Default Subject</label>
            <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Default Body</label>
            <textarea className={inputCls} rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Email body" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={savingConfig} className={`${btnCls} bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50`}>
              {savingConfig ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowSetup(false)} className={`${btnCls} ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-slate-200 text-slate-700'}`}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-base font-bold ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>Send Email</h3>
        <div className="flex gap-1">
          <button type="button" onClick={() => setShowSetup(true)} className="p-1.5 rounded-lg hover:bg-black/10" title="Email setup">
            <Settings className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <form onSubmit={handleSend} className="space-y-3">
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>To</label>
          <input className={inputCls} type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="Recipient email" required />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button type="button" onClick={() => setShowCc(!showCc)} className={`${showCc ? 'font-semibold' : ''} ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
            Cc
          </button>
          <button type="button" onClick={() => setShowBcc(!showBcc)} className={`${showBcc ? 'font-semibold' : ''} ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
            Bcc
          </button>
        </div>
        {showCc && (
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Cc</label>
            <input className={inputCls} type="text" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="email1@example.com, email2@example.com" />
          </div>
        )}
        {showBcc && (
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Bcc</label>
            <input className={inputCls} type="text" value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="email1@example.com, email2@example.com" />
          </div>
        )}
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Subject</label>
          <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Body</label>
          <textarea className={inputCls} rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" required />
        </div>
        <div>
          <label className={`flex items-center gap-2 text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            <Paperclip className="h-3.5 w-3.5" /> Attachments
          </label>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className={`${btnCls} flex items-center gap-2 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} border ${isDarkMode ? 'border-gray-600' : 'border-slate-200'}`}>
            <Paperclip className="h-4 w-4" /> Choose Files
          </button>
          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachments.map((a, i) => (
                <li key={i} className="flex justify-between items-center text-xs">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-slate-600'}>{a.filename}</span>
                  <button type="button" onClick={() => removeAttachment(i)} className="text-red-500 hover:underline">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={sending || !toEmail} className={`${btnCls} bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50`}>
            {sending ? 'Sending...' : 'Send'}
          </button>
          <button type="button" onClick={onClose} className={`${btnCls} ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-slate-200 text-slate-700'}`}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
