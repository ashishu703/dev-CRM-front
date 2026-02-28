import React from 'react';
import { MessageCircle, MoreVertical } from 'lucide-react';

/**
 * Reusable chat header: back button, avatar/initials, title, subtitle.
 * No call / video buttons per requirement.
 */
export default function ChatHeader({ title, subtitle, onBack, isMobile, avatarUrl }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`rounded-lg hover:bg-slate-200 text-slate-600 p-2 ${isMobile ? '' : 'sm:hidden'}`}
            aria-label="Back"
          >
            ←
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : title ? (
            title.charAt(0).toUpperCase()
          ) : (
            <MessageCircle className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{title || 'Chat'}</p>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button type="button" className="p-2 rounded-lg hover:bg-slate-200 text-slate-600" title="More">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
