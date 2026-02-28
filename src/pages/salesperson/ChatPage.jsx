'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MessageSquare,
  Search,
  Mail,
  Users,
  ListTodo,
  Plus,
  MessageCircle,
  UserPlus,
  X,
  Smartphone,
  Send,
  Download,
  Forward,
  Copy,
  Image,
  FileText,
  Video,
  Music,
} from 'lucide-react';
import { setSelectedConversation, clearSelectedConversation, setActiveTab, setUnreadCount } from '../../features/chat/chatSlice';
import {
  useGetChatUsersQuery,
  useGetConversationsQuery,
  useGetOrCreateDmMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useGetTeamsQuery,
  useCreateTeamMutation,
  useGetTeamConversationQuery,
  useLazyGetTeamConversationQuery,
  useGetTeamMembersQuery,
  useAddTeamMemberMutation,
  useGetMyTodosQuery,
  useGetAssignedByMeTodosQuery,
  useCreateTodoMutation,
  useCompleteTodoMutation,
  useGetUnreadCountQuery,
} from '../../features/chat/chatApi';
import { useGetEmailInboxQuery } from '../../features/email/emailApi';
import { useAuth } from '../../hooks/useAuth';
import ChatHeader from '../../components/chat/ChatHeader';
import MessageBubble from '../../components/chat/MessageBubble';
import MessageInput from '../../components/chat/MessageInput';
import SendEmailForm from '../../components/salesperson/SendEmailForm';
import Toast from '../../utils/Toast';
import io from 'socket.io-client';
import { baseApi } from '../../store/baseApi';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import QRCode from 'qrcode';

const TABS = [
  { id: 'internal', label: 'Internal Chat', icon: MessageSquare },
  { id: 'team', label: 'Team Chat', icon: Users },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
  { id: 'todo', label: 'Todo', icon: ListTodo },
];

const URL_REGEX = /(https?:\/\/[^\s<>]+)/gi;
function linkifyText(text, keyPrefix = '', isFromMe = false) {
  if (!text || typeof text !== 'string') return text;
  const parts = text.split(URL_REGEX);
  const linkCls = isFromMe ? 'underline text-green-100 hover:text-white' : 'underline text-blue-600 hover:text-blue-800';
  return parts.map((part, i) => {
    const isUrl = part.startsWith('http://') || part.startsWith('https://');
    if (isUrl) {
      return (
        <a key={`${keyPrefix}-${i}`} href={part} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {part}
        </a>
      );
    }
    return part;
  });
}

function useChatSocket(dispatch, invalidate, callbacks = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  const socketRef = useRef(null);
  const { onWhatsAppReady, onWhatsAppQR, onWhatsAppMessage } = callbacks;

  useEffect(() => {
    if (!token || !invalidate) return;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    const socketURL = base ? base.replace(/\/api.*$/, '').trim() : (typeof window !== 'undefined' ? window.location.origin : '');
    if (!socketURL) return;
    const socket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });
    socketRef.current = socket;
    socket.on('chat:message', () => invalidate(['ChatConversations', 'ChatUnread']));
    socket.on('todo:completed', () => invalidate('ChatTodos'));
    socket.on('whatsapp:ready', () => { onWhatsAppReady?.(); });
    socket.on('whatsapp:qr', (data) => { onWhatsAppQR?.(data); });
    socket.on('whatsapp:message', (data) => { onWhatsAppMessage?.(data); });
    return () => {
      socket.off('chat:message');
      socket.off('todo:completed');
      socket.off('whatsapp:ready');
      socket.off('whatsapp:qr');
      socket.off('whatsapp:message');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, invalidate, onWhatsAppReady, onWhatsAppQR, onWhatsAppMessage]);
}

export default function ChatPage({ isDarkMode = false }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const currentEmail = (user?.email || user?.username || '').toLowerCase().trim();

  const activeTab = useSelector((s) => s.chat?.activeTab ?? 'internal');
  const selectedConversationId = useSelector((s) => s.chat?.selectedConversationId);
  const selectedMeta = useSelector((s) => s.chat?.selectedConversationMeta);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [teamName, setTeamName] = React.useState('');
  const [teamParticipantEmails, setTeamParticipantEmails] = React.useState([]);
  const [showCreateTeam, setShowCreateTeam] = React.useState(false);
  const [showAddMembersTeamId, setShowAddMembersTeamId] = React.useState(null);
  const [addMembersSelected, setAddMembersSelected] = React.useState([]);
  const [showComposeEmail, setShowComposeEmail] = React.useState(false);
  const [showAssignTodo, setShowAssignTodo] = React.useState(false);
  const [todoTitle, setTodoTitle] = React.useState('');
  const [todoDescription, setTodoDescription] = React.useState('');
  const [todoAssignee, setTodoAssignee] = React.useState('');
  const messagesEndRef = useRef(null);

  const [whatsappStatus, setWhatsappStatus] = React.useState('disconnected');
  const [whatsappQR, setWhatsappQR] = React.useState(null);
  const [whatsappChats, setWhatsappChats] = React.useState([]);
  const [whatsappSelectedChatId, setWhatsappSelectedChatId] = React.useState(null);
  const [whatsappMessages, setWhatsappMessages] = React.useState([]);
  const [whatsappLoading, setWhatsappLoading] = React.useState(false);
  const [whatsappSendText, setWhatsappSendText] = React.useState('');
  const [whatsappMediaCache, setWhatsappMediaCache] = React.useState({});
  const [whatsappForwardMessageId, setWhatsappForwardMessageId] = React.useState(null);
  const [whatsappForwardToChatId, setWhatsappForwardToChatId] = React.useState('');
  const whatsappMessagesEndRef = useRef(null);
  const whatsappSelectedChatIdRef = useRef(null);
  whatsappSelectedChatIdRef.current = whatsappSelectedChatId;

  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  useEffect(() => {
    dispatch(setUnreadCount(unreadCount));
  }, [unreadCount, dispatch]);

  const invalidate = useMemo(
    () => (tags) => dispatch(baseApi.util.invalidateTags(Array.isArray(tags) ? tags : [tags])),
    [dispatch]
  );

  const onWhatsAppMessage = useMemo(
    () => (data) => {
      if (!whatsappSelectedChatIdRef.current || !data) return;
      const selectedId = whatsappSelectedChatIdRef.current;
      if (data.from === selectedId || (data.from && selectedId.includes(data.from))) {
        setWhatsappMessages((prev) => [...prev, { id: `wa-${Date.now()}`, from: data.from, fromMe: false, body: data.body || '', timestamp: data.timestamp || Date.now() }]);
      }
    },
    []
  );
  useChatSocket(dispatch, invalidate, {
    onWhatsAppReady: () => setWhatsappStatus('ready'),
    onWhatsAppQR: (data) => {
        const qr = data?.qr;
        setWhatsappStatus('qr');
        if (!qr) { setWhatsappQR(null); return; }
        if (typeof qr === 'string' && qr.startsWith('data:')) {
          setWhatsappQR(qr);
          return;
        }
        QRCode.toDataURL(qr).then(setWhatsappQR).catch(() => setWhatsappQR(null));
      },
    onWhatsAppMessage,
  });

  const { data: chatUsers = [] } = useGetChatUsersQuery();
  const { data: conversations = [] } = useGetConversationsQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const { data: emailInbox = [] } = useGetEmailInboxQuery();
  const { data: myTodos = [] } = useGetMyTodosQuery();
  const { data: assignedByMe = [] } = useGetAssignedByMeTodosQuery();

  const [getOrCreateDm] = useGetOrCreateDmMutation();
  const [sendMessage] = useSendMessageMutation();
  const [markRead] = useMarkConversationReadMutation();
  const [createTeam] = useCreateTeamMutation();
  const [getTeamConversation] = useLazyGetTeamConversationQuery();
  const [addTeamMember] = useAddTeamMemberMutation();
  const [createTodo] = useCreateTodoMutation();
  const [completeTodo] = useCompleteTodoMutation();

  const { data: teamMembers = [] } = useGetTeamMembersQuery(showAddMembersTeamId, { skip: !showAddMembersTeamId });

  const { data: messages = [], refetch: refetchMessages } = useGetMessagesQuery(
    { conversationId: selectedConversationId },
    { skip: !selectedConversationId }
  );

  const selectedConversation = useMemo(
    () => (conversations || []).find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedConversationId) {
      markRead(selectedConversationId).catch(() => {});
    }
  }, [selectedConversationId, markRead]);

  const handleSelectUser = async (otherUser) => {
    const otherEmail = (otherUser?.email || otherUser?.username || '').toLowerCase().trim();
    if (!otherEmail || otherEmail === currentEmail) return;
    try {
      const conv = await getOrCreateDm(otherEmail).unwrap();
      if (conv) {
        dispatch(setSelectedConversation({ id: conv.id, meta: { type: 'dm', otherUser } }));
      }
    } catch (e) {
      Toast.error(e?.data?.message || 'Failed to start conversation');
    }
  };

  const handleSelectConversation = (conv) => {
    const meta = conv.type === 'team'
      ? { type: 'team', teamName: conv.team_name }
      : { type: 'dm', otherUser: conv.participant_emails?.find((e) => e !== currentEmail) };
    dispatch(setSelectedConversation({ id: conv.id, meta }));
  };

  const handleSelectTeam = async (team) => {
    try {
      const result = await getTeamConversation(team.id).unwrap();
      const conv = result?.data ?? result;
      if (conv?.id) {
        dispatch(setSelectedConversation({ id: conv.id, meta: { type: 'team', teamName: team.name } }));
      } else {
        Toast.error('Failed to open team chat');
      }
    } catch (_) {
      Toast.error('Failed to open team chat');
    }
  };

  const handleSendMessage = async (payload) => {
    if (!selectedConversationId) return;
    try {
      await sendMessage({ conversationId: selectedConversationId, payload }).unwrap();
      refetchMessages();
    } catch (e) {
      Toast.error(e?.data?.message || 'Failed to send');
    }
  };

  const handleCreateTeam = async (e) => {
    e?.preventDefault();
    if (!teamName.trim()) return;
    try {
      const team = await createTeam(teamName.trim()).unwrap();
      const newTeamId = team?.id ?? team?.data?.id;
      if (newTeamId && Array.isArray(teamParticipantEmails) && teamParticipantEmails.length > 0) {
        for (const email of teamParticipantEmails) {
          const em = (email && String(email).toLowerCase().trim()) || '';
          if (em && em !== currentEmail) {
            try {
              await addTeamMember({ teamId: newTeamId, userEmail: em });
            } catch (_) {}
          }
        }
      }
      setTeamName('');
      setTeamParticipantEmails([]);
      setShowCreateTeam(false);
      Toast.success('Team created');
    } catch (err) {
      Toast.error(err?.data?.message || 'Failed to create team');
    }
  };

  const toggleTeamParticipant = (email) => {
    const em = (email || '').toLowerCase().trim();
    if (!em) return;
    setTeamParticipantEmails((prev) =>
      prev.includes(em) ? prev.filter((e) => e !== em) : [...prev, em]
    );
  };

  const handleAddMembersToTeam = async (e) => {
    e?.preventDefault();
    if (!showAddMembersTeamId || !addMembersSelected.length) return;
    try {
      for (const email of addMembersSelected) {
        await addTeamMember({ teamId: showAddMembersTeamId, userEmail: email });
      }
      setAddMembersSelected([]);
      setShowAddMembersTeamId(null);
      Toast.success('Members added');
    } catch (err) {
      Toast.error(err?.data?.message || 'Failed to add members');
    }
  };

  const toggleAddMemberSelection = (email) => {
    const em = (email || '').toLowerCase().trim();
    setAddMembersSelected((prev) =>
      prev.includes(em) ? prev.filter((e) => e !== em) : [...prev, em]
    );
  };

  const usersNotInTeam = useMemo(() => {
    const memberSet = new Set((teamMembers || []).map((m) => String(m).toLowerCase().trim()));
    return (chatUsers || []).filter(
      (u) => !memberSet.has((u.email || u.username || '').toLowerCase().trim())
    );
  }, [chatUsers, teamMembers]);

  const fetchWhatsAppStatus = React.useCallback(async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.WHATSAPP_STATUS());
      const payload = res?.data?.data ?? res?.data ?? res;
      const status = payload?.status;
      if (status) setWhatsappStatus(status);
      if (status === 'qr') {
        const qrRes = await apiClient.get(API_ENDPOINTS.WHATSAPP_QR());
        const qrPayload = qrRes?.data?.data ?? qrRes?.data ?? qrRes;
        if (qrPayload?.qr) {
          setWhatsappQR(qrPayload.qr);
        } else {
          setWhatsappQR(null);
          setTimeout(async () => {
            try {
              const retryRes = await apiClient.get(API_ENDPOINTS.WHATSAPP_QR());
              const retryPayload = retryRes?.data?.data ?? retryRes?.data ?? retryRes;
              if (retryPayload?.qr) setWhatsappQR(retryPayload.qr);
            } catch (_) {}
          }, 1500);
        }
      } else {
        setWhatsappQR(null);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (activeTab !== 'whatsapp') return;
    fetchWhatsAppStatus();
    const intervalMs =
      whatsappStatus === 'qr' ? 4000
      : whatsappStatus === 'disconnected' ? 5000
      : 5000;
    const t = setInterval(fetchWhatsAppStatus, intervalMs);
    return () => clearInterval(t);
  }, [activeTab, fetchWhatsAppStatus, whatsappStatus]);

  const handleWhatsAppStart = async () => {
    setWhatsappLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.WHATSAPP_START());
      await fetchWhatsAppStatus();
      Toast.success('Scan QR with WhatsApp on your phone');
    } catch (e) {
      Toast.error(e?.message || 'Failed to start WhatsApp');
    } finally {
      setWhatsappLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'whatsapp' || whatsappStatus !== 'ready') return;
    apiClient.get(API_ENDPOINTS.WHATSAPP_CHATS()).then((res) => {
      const data = res?.data?.data ?? res?.data ?? res;
      setWhatsappChats(Array.isArray(data) ? data : []);
    }).catch(() => setWhatsappChats([]));
  }, [activeTab, whatsappStatus]);

  useEffect(() => {
    if (!whatsappSelectedChatId) { setWhatsappMessages([]); return; }
    apiClient.get(API_ENDPOINTS.WHATSAPP_CHAT_MESSAGES(whatsappSelectedChatId, 'limit=50')).then((res) => {
      const data = res?.data?.data ?? res?.data ?? res;
      const list = Array.isArray(data) ? data : [];
      setWhatsappMessages(list.reverse());
    }).catch(() => setWhatsappMessages([]));
  }, [whatsappSelectedChatId]);

  useEffect(() => {
    whatsappMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [whatsappMessages]);

  const handleWhatsAppSend = async (e) => {
    e?.preventDefault();
    const text = (whatsappSendText || '').trim();
    if (!text || !whatsappSelectedChatId) return;
    try {
      await apiClient.post(API_ENDPOINTS.WHATSAPP_CHAT_SEND(whatsappSelectedChatId), { text });
      setWhatsappMessages((prev) => [...prev, { id: `wa-sent-${Date.now()}`, from: whatsappSelectedChatId, fromMe: true, body: text, timestamp: Math.floor(Date.now() / 1000) }]);
      setWhatsappSendText('');
    } catch (err) {
      Toast.error(err?.message || 'Failed to send');
    }
  };

  useEffect(() => {
    if (!whatsappSelectedChatId) return;
    whatsappMessages.forEach((msg) => {
      if (!msg.hasMedia || !msg.id || String(msg.id).startsWith('wa-')) return;
      if (whatsappMediaCache[msg.id]) return;
      apiClient.get(API_ENDPOINTS.WHATSAPP_CHAT_MESSAGE_MEDIA(whatsappSelectedChatId, msg.id))
        .then((res) => {
          const data = res?.data?.data ?? res?.data ?? res;
          if (data?.dataUrl) setWhatsappMediaCache((prev) => ({ ...prev, [msg.id]: data }));
        })
        .catch(() => {});
    });
  }, [whatsappMessages, whatsappSelectedChatId, whatsappMediaCache]);

  const handleWhatsAppDownload = async (msg) => {
    let dataUrl = whatsappMediaCache[msg.id]?.dataUrl;
    const mimetype = whatsappMediaCache[msg.id]?.mimetype;
    const filename = whatsappMediaCache[msg.id]?.filename;
    if (!dataUrl && msg.id && !String(msg.id).startsWith('wa-')) {
      try {
        const res = await apiClient.get(API_ENDPOINTS.WHATSAPP_CHAT_MESSAGE_MEDIA(whatsappSelectedChatId, msg.id));
        const data = res?.data?.data ?? res?.data ?? res;
        if (data?.dataUrl) {
          dataUrl = data.dataUrl;
          setWhatsappMediaCache((prev) => ({ ...prev, [msg.id]: data }));
        }
      } catch (e) {
        Toast.error('Could not download media');
        return;
      }
    }
    if (!dataUrl) return;
    const ext = (mimetype || '').split('/')[1] || 'bin';
    const name = filename || `media-${msg.id}.${ext}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = name;
    a.click();
    Toast.success('Downloaded');
  };

  const handleWhatsAppForward = async () => {
    if (!whatsappForwardMessageId || !whatsappForwardToChatId) return;
    try {
      await apiClient.post(API_ENDPOINTS.WHATSAPP_CHAT_MESSAGE_FORWARD(whatsappSelectedChatId, whatsappForwardMessageId), { toChatId: whatsappForwardToChatId });
      Toast.success('Message forwarded');
      setWhatsappForwardMessageId(null);
      setWhatsappForwardToChatId('');
    } catch (err) {
      Toast.error(err?.message || 'Failed to forward');
    }
  };

  const handleWhatsAppCopy = (msg) => {
    const text = (msg.body || '').trim() || (msg.hasMedia ? `[${msg.type || 'Media'}]` : '');
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => Toast.success('Copied')).catch(() => Toast.error('Copy failed'));
  };

  const handleCreateTodo = async (e) => {
    e?.preventDefault();
    const title = todoTitle.trim();
    const assignee = todoAssignee.trim();
    try {
      await createTodo({
        title: title || undefined,
        description: todoDescription.trim() || undefined,
        assigneeEmail: assignee || undefined,
      }).unwrap();
      setTodoTitle('');
      setTodoDescription('');
      setTodoAssignee('');
      setShowAssignTodo(false);
      Toast.success('Task added');
    } catch (err) {
      Toast.error(err?.data?.message || 'Failed to add task');
    }
  };

  const handleCompleteTodo = async (todoId) => {
    try {
      await completeTodo(todoId).unwrap();
      Toast.success('Marked as finished');
    } catch (err) {
      Toast.error(err?.data?.message || 'Failed to complete');
    }
  };

  const filteredUsers = useMemo(
    () => (chatUsers || []).filter(
      (u) => !searchQuery || (u.username || u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [chatUsers, searchQuery]
  );

  const displayTitle = selectedMeta?.teamName || selectedMeta?.otherUser?.username || selectedMeta?.otherUser?.email || 'Chat';
  const displaySubtitle = selectedMeta?.type === 'team' ? 'Team' : selectedMeta?.type === 'dm' ? 'Direct message' : '';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      <div className="flex-shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 p-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { dispatch(setActiveTab(tab.id)); dispatch(clearSelectedConversation()); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left panel */}
        <div
          className={`w-full sm:w-80 md:w-96 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white ${
            selectedConversationId ? 'hidden sm:flex' : ''
          }`}
        >
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'internal' && (
              <>
                {filteredUsers.map((u) => (
                  <button
                    key={u.id || u.email}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                      {(u.username || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-800 truncate block">{u.username || u.email}</span>
                      <span className="text-xs text-slate-500">{u.role}</span>
                    </div>
                  </button>
                ))}
              </>
            )}
            {activeTab === 'team' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 border-b border-slate-100 text-emerald-700"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create team</span>
                </button>
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1 border-b border-slate-50 hover:bg-slate-50"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectTeam(t)}
                      className="flex-1 flex items-center gap-3 px-4 py-3 text-left min-w-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-slate-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-800 truncate block">{t.name}</span>
                        <span className="text-xs text-slate-500">{t.member_count ?? 0} members</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); setShowAddMembersTeamId(t.id); setAddMembersSelected([]); }}
                      className="p-2 rounded-lg hover:bg-emerald-100 text-slate-500 hover:text-emerald-700"
                      title="Add participants"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </>
            )}
            {activeTab === 'emails' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowComposeEmail(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 border-b border-slate-100 text-emerald-700"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Compose</span>
                </button>
                {emailInbox.length === 0 && (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    <Mail className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p>No sent emails yet.</p>
                  </div>
                )}
                {emailInbox.map((em) => (
                  <div key={em.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50">
                    <p className="font-medium text-slate-800 truncate">{em.customerEmail || 'Email'}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {typeof em.payload === 'object' && em.payload?.subject ? em.payload.subject : '—'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {em.sentAt ? new Date(em.sentAt).toLocaleString() : ''}
                    </p>
                  </div>
                ))}
              </>
            )}
            {activeTab === 'whatsapp' && (
              <>
                {whatsappStatus === 'disconnected' && (
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <Smartphone className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-sm font-medium text-slate-700">WhatsApp Web</p>
                    <p className="text-xs text-slate-500 mt-1">Connect your WhatsApp to chat from here</p>
                    <button
                      type="button"
                      onClick={handleWhatsAppStart}
                      disabled={whatsappLoading}
                      className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {whatsappLoading ? 'Connecting...' : 'Connect WhatsApp'}
                    </button>
                  </div>
                )}
                {whatsappStatus === 'qr' && (
                  <div className="p-4 flex flex-col items-center text-center">
                    <p className="text-sm font-medium text-slate-700 mb-2">Scan QR code</p>
                    <p className="text-xs text-slate-500 mb-3">Open WhatsApp on your phone → Linked devices → Link a device</p>
                    {whatsappQR ? (
                      <img src={whatsappQR} alt="WhatsApp QR" className="w-56 h-56 border border-slate-200 rounded-lg bg-white" />
                    ) : (
                      <div className="w-56 h-56 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">Loading QR...</div>
                    )}
                  </div>
                )}
                {whatsappStatus === 'ready' && (
                  <>
                    {whatsappChats.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setWhatsappSelectedChatId(ch.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-50 hover:bg-slate-50 ${whatsappSelectedChatId === ch.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {ch.profilePicUrl ? (
                            <img src={ch.profilePicUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <MessageCircle className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-800 truncate block">{ch.name}</span>
                          <span className="text-xs text-slate-500 truncate block">{ch.lastMessage || 'No messages'}</span>
                        </div>
                        {ch.unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                            {ch.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
            {activeTab === 'todo' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowAssignTodo(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 border-b border-slate-100 text-emerald-700"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Assign todo</span>
                </button>
                <div className="p-2 text-xs font-semibold text-slate-500 uppercase">Assigned to me</div>
                {myTodos.map((todo) => (
                  <div key={todo.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex items-center justify-between gap-2">
                    <span className={todo.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}>
                      {todo.title}
                    </span>
                    {todo.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleCompleteTodo(todo.id)}
                        className="text-xs bg-emerald-600 text-white px-2 py-1 rounded"
                      >
                        Mark finished
                      </button>
                    )}
                    {todo.status === 'completed' && <span className="text-xs text-emerald-600">Done</span>}
                  </div>
                ))}
                <div className="p-2 text-xs font-semibold text-slate-500 uppercase mt-2">Assigned by me</div>
                {assignedByMe.map((todo) => (
                  <div key={todo.id} className="px-4 py-3 border-b border-slate-50">
                    <span className={todo.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}>
                      {todo.title}
                    </span>
                    <span className="text-xs text-slate-500 block">→ {todo.assignee_email}</span>
                    {todo.completed_at && (
                      <span className="text-xs text-emerald-600">Completed</span>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right: chat area or email compose or placeholder */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-[#e5ddd5] bg-chat-pattern ${
            selectedConversationId && activeTab !== 'emails' && activeTab !== 'todo' ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {activeTab === 'emails' && showComposeEmail && (
            <div className="flex-1 overflow-auto p-4">
              <SendEmailForm customer={{ email: '', name: '' }} onClose={() => setShowComposeEmail(false)} isDarkMode={isDarkMode} />
            </div>
          )}
          {activeTab === 'todo' && showAssignTodo && (
            <div className="flex-1 overflow-auto p-4 max-w-md">
              <form onSubmit={handleCreateTodo} className="bg-white rounded-xl border p-4 space-y-4">
                <h3 className="font-bold text-slate-800">Task list</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={todoTitle}
                    onChange={(e) => setTodoTitle(e.target.value)}
                    placeholder="Task title (optional)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Assignee</label>
                  <select
                    value={todoAssignee}
                    onChange={(e) => setTodoAssignee(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Select user...</option>
                    {(chatUsers || []).map((u) => {
                      const em = (u.email || u.username || '').toLowerCase().trim();
                      if (!em || em === currentEmail) return null;
                      return (
                        <option key={u.id || em} value={em}>
                          {u.username || u.email} {u.role ? `(${u.role})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description (optional)</label>
                  <textarea
                    value={todoDescription}
                    onChange={(e) => setTodoDescription(e.target.value)}
                    placeholder="Description"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                    Add task
                  </button>
                  <button type="button" onClick={() => setShowAssignTodo(false)} className="px-4 py-2 bg-slate-200 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          {!selectedConversationId && activeTab !== 'emails' && activeTab !== 'todo' && activeTab !== 'whatsapp' && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
              <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center mb-4 shadow-sm">
                <MessageCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <p className="font-medium text-slate-700">Chat</p>
              <p className="text-sm mt-1 text-center max-w-xs">
                {activeTab === 'internal' && 'Select a person to start a conversation.'}
                {activeTab === 'team' && 'Select a team or create one.'}
              </p>
            </div>
          )}
          {activeTab === 'whatsapp' && (
            <>
              {whatsappStatus !== 'ready' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
                  <Smartphone className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="font-medium text-slate-700">WhatsApp</p>
                  <p className="text-sm mt-1 text-center max-w-xs">
                    {whatsappStatus === 'disconnected' && 'Click Connect WhatsApp in the left panel.'}
                    {whatsappStatus === 'qr' && 'Scan the QR code from the left panel with your phone.'}
                  </p>
                </div>
              ) : !whatsappSelectedChatId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
                  <MessageCircle className="w-12 h-12 text-green-500 mb-4" />
                  <p className="font-medium text-slate-700">WhatsApp</p>
                  <p className="text-sm mt-1 text-center max-w-xs">Select a chat from the list to view and send messages.</p>
                </div>
              ) : (
                <>
                  <ChatHeader
                    title={whatsappChats.find((c) => c.id === whatsappSelectedChatId)?.name || 'Chat'}
                    subtitle="WhatsApp"
                    onBack={() => setWhatsappSelectedChatId(null)}
                    isMobile
                    avatarUrl={whatsappChats.find((c) => c.id === whatsappSelectedChatId)?.profilePicUrl}
                  />
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {whatsappMessages.map((msg) => {
                      const isFromMe = msg.fromMe;
                      const bubbleCls = `max-w-[85%] rounded-2xl px-4 py-2 ${isFromMe ? 'bg-green-500 text-white rounded-br-md' : 'bg-slate-200 text-slate-800 rounded-bl-md'}`;
                      const timeCls = `text-xs mt-1 ${isFromMe ? 'text-green-100' : 'text-slate-500'}`;
                      const mediaData = msg.id && !String(msg.id).startsWith('wa-') ? whatsappMediaCache[msg.id] : null;
                      const isMedia = !!msg.hasMedia;
                      const mediaType = (msg.type || '').toLowerCase();
                      return (
                        <div key={msg.id || `${msg.timestamp}-${msg.body?.slice(0, 8)}`} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={bubbleCls}>
                            {isMedia && (
                              <div className="mb-2 rounded-lg overflow-hidden bg-black/20 max-w-[280px]">
                                {mediaData?.dataUrl ? (
                                  <>
                                    {mediaType === 'image' && <img src={mediaData.dataUrl} alt="" className="max-h-64 w-full object-contain" />}
                                    {(mediaType === 'video' || mediaType === 'sticker') && (
                                      <video src={mediaData.dataUrl} controls className="max-h-64 w-full" />
                                    )}
                                    {mediaType === 'audio' && (
                                      <audio src={mediaData.dataUrl} controls className="w-full" />
                                    )}
                                    {(mediaType === 'document' || mediaType === 'ptt' || !['image', 'video', 'audio', 'sticker'].includes(mediaType)) && (
                                      <div className="p-3 flex items-center gap-2">
                                        <FileText className="w-10 h-10 flex-shrink-0" />
                                        <span className="text-sm truncate">{mediaData.filename || 'Document'}</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="p-6 flex items-center justify-center gap-2 text-sm">
                                    {mediaType === 'image' && <Image className="w-8 h-8" />}
                                    {mediaType === 'video' && <Video className="w-8 h-8" />}
                                    {mediaType === 'audio' && <Music className="w-8 h-8" />}
                                    {(!mediaType || mediaType === 'document' || mediaType === 'ptt') && <FileText className="w-8 h-8" />}
                                    <span>Loading…</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {(msg.body || '').trim() ? (
                              <p className="text-sm whitespace-pre-wrap break-words">{linkifyText(msg.body, msg.id, isFromMe)}</p>
                            ) : null}
                            <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                              {msg.timestamp && (
                                <span className={timeCls}>
                                  {new Date(msg.timestamp > 1e12 ? msg.timestamp : msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              <div className={`flex gap-1 ${isFromMe ? 'text-green-100' : 'text-slate-500'}`}>
                                {isMedia && (
                                  <button type="button" onClick={() => handleWhatsAppDownload(msg)} className="p-1.5 rounded hover:bg-black/10" title="Download">
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                                {msg.id && !String(msg.id).startsWith('wa-') && (
                                  <button type="button" onClick={() => setWhatsappForwardMessageId(msg.id)} className="p-1.5 rounded hover:bg-black/10" title="Forward">
                                    <Forward className="w-4 h-4" />
                                  </button>
                                )}
                                <button type="button" onClick={() => handleWhatsAppCopy(msg)} className="p-1.5 rounded hover:bg-black/10" title="Copy">
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={whatsappMessagesEndRef} />
                  </div>
                  <form onSubmit={handleWhatsAppSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                    <input
                      type="text"
                      value={whatsappSendText}
                      onChange={(e) => setWhatsappSendText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button type="submit" className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600">
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </>
              )}
            </>
          )}
          {selectedConversationId && (activeTab === 'internal' || activeTab === 'team') && (
            <>
              <ChatHeader
                title={displayTitle}
                subtitle={displaySubtitle}
                onBack={() => dispatch(clearSelectedConversation())}
                isMobile
              />
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={(msg.sender_email || '').toLowerCase() === currentEmail}
                    senderName={msg.sender_email}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <MessageInput onSend={handleSendMessage} currentUserEmail={currentEmail} />
            </>
          )}
        </div>
      </div>

      {showCreateTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800">Create team</h3>
              <button type="button" onClick={() => { setShowCreateTeam(false); setTeamParticipantEmails([]); }} className="p-1 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="flex flex-col gap-3 flex-1 min-h-0">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Team name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <label className="block text-xs font-medium text-slate-500 mb-1">Add participants</label>
                <div className="border border-slate-200 rounded-lg p-2 overflow-y-auto max-h-48 space-y-1">
                  {(chatUsers || []).map((u) => {
                    const em = (u.email || u.username || '').toLowerCase().trim();
                    if (!em || em === currentEmail) return null;
                    const checked = teamParticipantEmails.includes(em);
                    return (
                      <label key={u.id || em} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTeamParticipant(em)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-800">{u.username || u.email}</span>
                        {u.role && <span className="text-xs text-slate-500">({u.role})</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                  Create
                </button>
                <button type="button" onClick={() => { setShowCreateTeam(false); setTeamParticipantEmails([]); }} className="px-4 py-2 bg-slate-200 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMembersTeamId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800">Add participants</h3>
              <button type="button" onClick={() => { setShowAddMembersTeamId(null); setAddMembersSelected([]); }} className="p-1 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMembersToTeam} className="flex flex-col gap-3 flex-1 min-h-0">
              <div className="flex-1 min-h-0 flex flex-col">
                <p className="text-xs text-slate-500 mb-2">Select users to add to this team</p>
                <div className="border border-slate-200 rounded-lg p-2 overflow-y-auto max-h-64 space-y-1">
                  {usersNotInTeam.length === 0 ? (
                    <p className="text-sm text-slate-500 py-2">No users to add (all are already members)</p>
                  ) : (
                    usersNotInTeam.map((u) => {
                      const em = (u.email || u.username || '').toLowerCase().trim();
                      if (!em) return null;
                      const checked = addMembersSelected.includes(em);
                      return (
                        <label key={u.id || em} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAddMemberSelection(em)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-800">{u.username || u.email}</span>
                          {u.role && <span className="text-xs text-slate-500">({u.role})</span>}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={addMembersSelected.length === 0} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50">
                  Add selected
                </button>
                <button type="button" onClick={() => { setShowAddMembersTeamId(null); setAddMembersSelected([]); }} className="px-4 py-2 bg-slate-200 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {whatsappForwardMessageId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 max-w-sm w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800">Forward to</h3>
              <button type="button" onClick={() => { setWhatsappForwardMessageId(null); setWhatsappForwardToChatId(''); }} className="p-1 rounded hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <select
              value={whatsappForwardToChatId}
              onChange={(e) => setWhatsappForwardToChatId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white mb-3"
            >
              <option value="">Select chat...</option>
              {whatsappChats.filter((c) => c.id !== whatsappSelectedChatId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={handleWhatsAppForward} disabled={!whatsappForwardToChatId} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50">
                Forward
              </button>
              <button type="button" onClick={() => { setWhatsappForwardMessageId(null); setWhatsappForwardToChatId(''); }} className="px-4 py-2 bg-slate-200 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bg-chat-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}
