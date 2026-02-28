import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Image, FileText, Music, Video, Smile } from 'lucide-react';

// Lazy load emoji picker (ESM)
let EmojiPickerComponent = null;
export function useEmojiPicker() {
  const [Picker, setPicker] = useState(null);
  useEffect(() => {
    if (EmojiPickerComponent) {
      setPicker(() => EmojiPickerComponent);
      return;
    }
    import('emoji-picker-react')
      .then((mod) => {
        EmojiPickerComponent = mod.default;
        setPicker(() => EmojiPickerComponent);
      })
      .catch(() => {});
  }, []);
  return Picker;
}

/**
 * Message input: text, emoji picker, attach (image/audio/video/doc), send.
 */
export default function MessageInput({ onSend, currentUserEmail, disabled }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const attachTypeRef = useRef(null);
  const EmojiPicker = useEmojiPicker();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    const payload = { text: trimmed };
    if (attachments.length) payload.attachments = attachments;
    onSend(payload);
    setText('');
    setAttachments([]);
    setShowEmoji(false);
    setShowAttach(false);
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + (emojiData.emoji || ''));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const type = attachTypeRef.current || 'document';
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        let attType = type;
        if (file.type.startsWith('image/')) attType = 'image';
        else if (file.type.startsWith('audio/')) attType = 'audio';
        else if (file.type.startsWith('video/')) attType = 'video';
        setAttachments((prev) => [...prev, { type: attType, filename: file.name, content: content?.split?.(',')?.[1] || content }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const openFile = (accept, type) => {
    attachTypeRef.current = type;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-shrink-0 p-3 bg-slate-100 border-t border-slate-200">
      <div className="flex items-end gap-2">
        <div className="relative flex-1 flex items-end gap-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
          <div className="relative pl-2 pb-2 flex items-center gap-0">
            <button
              type="button"
              onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              title="Attach"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            {showAttach && (
              <div className="absolute bottom-full left-0 mb-1 py-2 px-2 bg-white rounded-xl shadow-lg border border-slate-200 z-20 flex flex-col gap-0">
                <button type="button" onClick={() => { openFile('image/*', 'image'); setShowAttach(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700">
                  <Image className="w-4 h-4 text-emerald-600" /> Photo / Image
                </button>
                <button type="button" onClick={() => { openFile('audio/*', 'audio'); setShowAttach(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700">
                  <Music className="w-4 h-4 text-blue-600" /> Audio
                </button>
                <button type="button" onClick={() => { openFile('video/*', 'video'); setShowAttach(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700">
                  <Video className="w-4 h-4 text-purple-600" /> Video
                </button>
                <button type="button" onClick={() => { openFile('.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv', 'document'); setShowAttach(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700">
                  <FileText className="w-4 h-4 text-slate-600" /> Document
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 min-h-[44px] max-h-32 py-3 px-2 resize-none bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
            disabled={disabled}
          />
          {EmojiPicker ? (
            <>
              <button
                type="button"
                onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 pb-2"
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmoji && (
                <div className="absolute bottom-full right-0 mb-1 z-20">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </>
          ) : (
            <button type="button" className="p-2 rounded-full hover:bg-slate-100 text-slate-400 pb-2" title="Emoji">
              <Smile className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center text-white shadow-md transition-colors"
          title="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 text-xs text-slate-500">
          {attachments.map((a, i) => (
            <span key={i} className="bg-white px-2 py-1 rounded border border-slate-200">
              {a.filename || a.type}
              <button type="button" onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} className="ml-1 text-red-500 hover:underline">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
