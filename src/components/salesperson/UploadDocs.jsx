import React, { useCallback, useRef, useState } from 'react';
import { X, Upload, FileText, ExternalLink, Loader2, Camera } from 'lucide-react';
import { useGetDocsByLeadIdQuery, useGetPhotosByLeadIdQuery, useUploadLeadDocMutation, useUploadLeadPhotoMutation } from '../../features/leadDocs/leadDocsApi';
import Toast from '../../utils/Toast';

export default function UploadDocs({ leadId, onClose, isDarkMode = false }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'photo'
  const [reason, setReason] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [expense, setExpense] = useState('');
  const [gps, setGps] = useState({ lat: null, lng: null, error: null });
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const { data: docs = [], isLoading } = useGetDocsByLeadIdQuery(leadId, { skip: !leadId });
  const { data: photos = [], isLoading: loadingPhotos } = useGetPhotosByLeadIdQuery(leadId, { skip: !leadId });
  const [uploadDoc, { isLoading: uploading }] = useUploadLeadDocMutation();
  const [uploadPhoto, { isLoading: uploadingPhoto }] = useUploadLeadPhotoMutation();

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !leadId) return;
      try {
        await uploadDoc({ leadId, file }).unwrap();
        Toast.success('Document uploaded');
        e.target.value = '';
      } catch (err) {
        Toast.error(err?.error?.message || err?.data?.message || 'Upload failed');
      }
    },
    [leadId, uploadDoc]
  );

  const getGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGps({ lat: null, lng: null, error: 'GPS not supported' });
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, error: null };
          setGps(coords);
          resolve(coords);
        },
        () => {
          setGps({ lat: null, lng: null, error: 'Location denied' });
          resolve(null);
        }
      );
    });
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      Toast.error('Camera access denied');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !leadId) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const coords = await getGps();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        try {
          await uploadPhoto({
            leadId,
            file,
            metadata: {
              reason: reason.trim() || undefined,
              meeting_notes: meetingNotes.trim() || undefined,
              expense: expense ? parseFloat(expense) : undefined,
              gps_lat: coords?.lat,
              gps_lng: coords?.lng,
            },
          }).unwrap();
          Toast.success('Photo saved with GPS');
          setReason('');
          setMeetingNotes('');
          setExpense('');
          stopCamera();
          setMode('upload');
        } catch (err) {
          Toast.error(err?.error?.message || err?.data?.message || 'Failed to save photo');
        }
      },
      'image/jpeg',
      0.9
    );
  }, [leadId, reason, meetingNotes, expense, getGps, uploadPhoto, stopCamera]);

  const handlePhotoFile = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || !leadId) return;
      const coords = await getGps();
      try {
        await uploadPhoto({
          leadId,
          file,
          metadata: {
            reason: reason.trim() || undefined,
            meeting_notes: meetingNotes.trim() || undefined,
            expense: expense ? parseFloat(expense) : undefined,
            gps_lat: coords?.lat,
            gps_lng: coords?.lng,
          },
        }).unwrap();
        Toast.success('Photo saved');
        setReason('');
        setMeetingNotes('');
        setExpense('');
        e.target.value = '';
      } catch (err) {
        Toast.error(err?.error?.message || err?.data?.message || 'Failed to save photo');
      }
    },
    [leadId, reason, meetingNotes, expense, getGps, uploadPhoto]
  );

  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`;
  const btnCls = `px-4 py-2 rounded-lg font-medium text-sm transition-colors`;

  return (
    <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-base font-bold ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>Docs & Photos</h3>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`${btnCls} flex-1 flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'}`}
        >
          <Upload className="h-4 w-4" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => { setMode('photo'); if (mode === 'photo') startCamera(); }}
          className={`${btnCls} flex-1 flex items-center justify-center gap-2 ${mode === 'photo' ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'}`}
        >
          <Camera className="h-4 w-4" /> Take Photo
        </button>
      </div>

      {mode === 'upload' && (
        <>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*,.ppt,.pptx" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !leadId}
            className={`${btnCls} w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 mb-4`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Choose file (Cloudinary)'}
          </button>
          <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>PDF, DOC, XLS, TXT, CSV, images supported.</p>
        </>
      )}

      {mode === 'photo' && (
        <div className="space-y-3 mb-4">
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Reason (optional)</label>
            <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Site visit" />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Meeting notes (optional)</label>
            <textarea className={inputCls} rows={2} value={meetingNotes} onChange={(e) => setMeetingNotes(e.target.value)} placeholder="Notes..." />
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Expense (optional)</label>
            <input className={inputCls} type="number" step="0.01" value={expense} onChange={(e) => setExpense(e.target.value)} placeholder="0" />
          </div>
          {gps.error && <p className="text-xs text-amber-600">{gps.error}</p>}
          {gps.lat && <p className="text-xs text-emerald-600">GPS: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}</p>}
          {!stream ? (
            <div className="flex gap-2">
              <button type="button" onClick={startCamera} className={`${btnCls} flex-1 bg-indigo-600 text-white`}>Open Camera</button>
              <input ref={photoInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handlePhotoFile} />
              <button type="button" onClick={() => photoInputRef.current?.click()} className={`${btnCls} flex-1 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-slate-200 text-slate-700'}`}>Pick from gallery</button>
            </div>
          ) : (
            <div>
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-2">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <button type="button" onClick={capturePhoto} disabled={uploadingPhoto} className={`${btnCls} flex-1 bg-emerald-600 text-white`}>
                  {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Capture & Save'}
                </button>
                <button type="button" onClick={stopCamera} className={`${btnCls} ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-slate-200 text-slate-700'}`}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {docs.length > 0 && (
        <div className="mb-4">
          <h4 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Documents</h4>
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                  <span className={`text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{d.filename}</span>
                </div>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-black/10 flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {photos.length > 0 && (
        <div>
          <h4 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Photos (GPS)</h4>
          <ul className="space-y-2">
            {photos.map((p) => (
              <li key={p.id} className={`flex items-center gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-700">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </a>
                <div className="min-w-0 flex-1">
                  <span className={`text-sm block truncate ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{p.reason || p.filename}</span>
                  {p.gpsLat && <span className="text-xs text-slate-500">GPS: {p.gpsLat.toFixed(4)}, {p.gpsLng.toFixed(4)}</span>}
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-black/10 flex-shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {docs.length === 0 && photos.length === 0 && !isLoading && !loadingPhotos && (
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>No documents or photos yet.</p>
      )}
    </div>
  );
}
