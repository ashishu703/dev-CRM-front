import React from 'react';
import { Image, FileText, Music, Video, File } from 'lucide-react';

/**
 * Single message bubble. Supports text + attachments (image, audio, video, document).
 */
export default function MessageBubble({ message, isMe, senderName }) {
  const payload = message?.payload || {};
  const text = payload.text || '';
  const attachments = payload.attachments || [];

  const renderAttachment = (att) => {
    if (!att) return null;
    const { type, url, filename, content } = att;
    if (type === 'image' || (filename && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) || content?.startsWith?.('data:image')) {
      const src = url || (content && content.startsWith('data:') ? content : null);
      if (src) return <img src={src} alt="" className="max-w-full max-h-64 rounded-lg my-1" />;
      return <div className="flex items-center gap-2 text-sm text-slate-600"><Image className="w-4 h-4" /> {filename || 'Image'}</div>;
    }
    if (type === 'audio' || (filename && /\.(mp3|wav|ogg|m4a)$/i.test(filename))) {
      const src = url || (content && content.startsWith('data:') ? content : null);
      if (src) return <audio src={src} controls className="max-w-full my-1" />;
      return <div className="flex items-center gap-2 text-sm text-slate-600"><Music className="w-4 h-4" /> {filename || 'Audio'}</div>;
    }
    if (type === 'video' || (filename && /\.(mp4|webm|ogg)$/i.test(filename))) {
      const src = url || (content && content.startsWith('data:') ? content : null);
      if (src) return <video src={src} controls className="max-w-full max-h-48 rounded-lg my-1" />;
      return <div className="flex items-center gap-2 text-sm text-slate-600"><Video className="w-4 h-4" /> {filename || 'Video'}</div>;
    }
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <FileText className="w-4 h-4" /> {filename || 'Document'}
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Open</a>}
      </div>
    );
  };

  const time = message?.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm ${
          isMe ? 'bg-[#d9fdd3] text-slate-800 rounded-br-md' : 'bg-white text-slate-800 rounded-bl-md'
        }`}
      >
        {!isMe && senderName && <p className="text-xs font-medium text-emerald-700 mb-0.5">{senderName}</p>}
        {text ? <p className="text-sm whitespace-pre-wrap break-words">{text}</p> : null}
        {attachments.map((a, i) => <div key={i}>{renderAttachment(a)}</div>)}
        <p className="text-[10px] text-slate-400 mt-1 text-right">{time}</p>
      </div>
    </div>
  );
}
