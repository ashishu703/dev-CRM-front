import { useState, useEffect, useRef, useCallback, useContext } from "react"
import {
  X,
  Send,
  Loader2,
  LayoutDashboard,
  Users,
  ClipboardList,
  Phone,
  BarChart2,
  HelpCircle,
  Sparkles,
} from "lucide-react"
import apiClient from "../utils/apiClient"
import { AuthContext } from "../context/AuthContext"

const ASHVAY_LOGO =
  "https://res.cloudinary.com/dngojnptn/image/upload/v1764139419/ChatGPT_Image_Nov_26_2025_11_50_20_AM_qkwcqe.png"

const GRADIENT = "linear-gradient(135deg, #0d9488 0%, #0f766e 45%, #059669 100%)"

const SUGGESTED_QUESTIONS = [
  "Aaj mere kitne follow-up due hain?",
  "Meri pending leads kitni hain?",
  "Is mahine kitni enquiries hain?",
  "Kitne quotations bheje gaye?",
  "High priority leads kaun se hain?",
  "Kal ke liye reminder kitne hain?",
]

function displayNameFromUser(user) {
  if (!user) return "there"
  const n = (user.name || user.username || "").trim()
  if (n) return n
  const em = user.email
  if (em && typeof em === "string") return em.split("@")[0].replace(/[._]/g, " ")
  return "there"
}

/** One visible character for the user bubble (not hardcoded "U"). */
function userAvatarGlyph(displayName) {
  const s = String(displayName || "").trim()
  if (!s || s === "there") return "•"
  const ch = [...s][0]
  if (!ch) return "•"
  return ch.toUpperCase()
}

export default function AshvayChat({ showFloatingButton = true }) {
  const { user } = useContext(AuthContext)
  const displayName = displayNameFromUser(user)

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [thread, setThread] = useState([])
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef(null)
  const logoRef = useRef(null)
  const [position, setPosition] = useState({ x: null, y: null })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const mouseDownPosRef = useRef({ x: 0, y: 0 })

  const hasThread = thread.length > 0

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread, open, sending])

  useEffect(() => {
    if (position.x === null && position.y === null) {
      setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 })
    }
  }, [position])

  useEffect(() => {
    const handleResize = () => {
      if (logoRef.current && position.x !== null && position.y !== null) {
        const logoRect = logoRef.current.getBoundingClientRect()
        const maxX = window.innerWidth - logoRect.width
        const maxY = window.innerHeight - logoRect.height
        setPosition((prev) => ({
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY),
        }))
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [position])

  const handleMouseDown = (e) => {
    if (!showFloatingButton) return
    setIsDragging(true)
    const currentX = position.x !== null ? position.x : window.innerWidth - 100
    const currentY = position.y !== null ? position.y : window.innerHeight - 100
    dragStartRef.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    }
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e) => {
    const logoRect = logoRef.current?.getBoundingClientRect()
    if (!logoRect) return
    const newX = e.clientX - dragStartRef.current.x
    const newY = e.clientY - dragStartRef.current.y
    const maxX = window.innerWidth - logoRect.width
    const maxY = window.innerHeight - logoRect.height
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    })
  }, [])

  const handleMouseUp = useCallback((e) => {
    setIsDragging(false)
    const moved =
      Math.abs(e.clientX - mouseDownPosRef.current.x) > 5 ||
      Math.abs(e.clientY - mouseDownPosRef.current.y) > 5
    if (!moved) setOpen(true)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const toApiMessages = useCallback((msgs) => {
    const out = []
    for (const m of msgs) {
      if (m.sender === "user") out.push({ role: "user", content: m.message })
      else if (m.sender === "ashvay") out.push({ role: "assistant", content: m.message })
    }
    return out.slice(-10)
  }, [])

  const sendText = useCallback(
    async (rawText) => {
      const text = String(rawText || "").trim()
      if (!text || sending) return

      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("authToken") || apiClient.getAuthToken()
          : null

      const userMessage = {
        id: Date.now(),
        sender: "user",
        message: text,
        timestamp: new Date(),
      }
      const nextThread = [...thread, userMessage]
      setThread(nextThread)
      setMessage("")
      setSending(true)

      if (!token) {
        setThread((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ashvay",
            message: "Data ke liye pehle login karo.",
            timestamp: new Date(),
          },
        ])
        setSending(false)
        return
      }

      try {
        const res = await apiClient.post("/api/ashvay/chat", {
          messages: toApiMessages(nextThread),
        })
        const reply =
          res?.reply ||
          res?.data?.reply ||
          (typeof res === "object" && res.success === false ? res.error : null) ||
          "Koi response nahi mila — try again."
        setThread((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            sender: "ashvay",
            message: reply,
            timestamp: new Date(),
          },
        ])
      } catch (err) {
        const msg =
          err?.message ||
          err?.data?.error ||
          "Network error — Ollama / backend check karo."
        setThread((prev) => [
          ...prev,
          {
            id: Date.now() + 3,
            sender: "ashvay",
            message: msg,
            timestamp: new Date(),
          },
        ])
      } finally {
        setSending(false)
      }
    },
    [thread, sending, toApiMessages]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    sendText(message)
  }

  const quickPrompts = [
    { icon: LayoutDashboard, label: "Summary", q: "Aaj ka short summary: calls, enquiries, follow-up?" },
    { icon: Users, label: "Leads", q: "Meri active leads kitni hain status ke hisaab se?" },
    { icon: ClipboardList, label: "Follow-up", q: "Aaj mere kitne follow-up due hain?" },
    { icon: Phone, label: "Calls", q: "Aaj kitne leads par activity / calls hui?" },
    { icon: BarChart2, label: "Pipeline", q: "Mere pipeline me quotation ya negotiation stage par kitne leads hain?" },
    { icon: HelpCircle, label: "Help", q: "Tu kya kya data dikha sakta hai? Short me batao." },
  ]

  return (
    <>
      {showFloatingButton ? (
        <button
          type="button"
          ref={logoRef}
          onMouseDown={handleMouseDown}
          className="fixed z-[100] w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform overflow-hidden ring-2 ring-white cursor-move"
          style={{
            background: GRADIENT,
            left: position.x !== null ? `${position.x}px` : "auto",
            top: position.y !== null ? `${position.y}px` : "auto",
            right: position.x === null ? "24px" : "auto",
            bottom: position.y === null ? "24px" : "auto",
            userSelect: "none",
          }}
          aria-label="Open Ashvay"
        >
          <img src={ASHVAY_LOGO} alt="" className="w-[88%] h-[88%] object-contain rounded-full pointer-events-none" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed z-[100] bottom-5 right-5 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-white font-semibold text-sm ring-2 ring-white/80 hover:opacity-95 transition-transform hover:scale-[1.02]"
          style={{ background: GRADIENT }}
        >
          <span className="w-6 h-6 rounded-full overflow-hidden bg-white/90 ring-1 ring-white/70 shrink-0">
            <img src={ASHVAY_LOGO} alt="" className="w-full h-full object-cover" />
          </span>
          Ashvay
        </button>
      )}

      {open && (
        <div
          className={`fixed z-[110] flex flex-col w-[min(100vw-1.25rem,420px)] h-[min(78vh,600px)] max-h-[calc(100dvh-4rem)] rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-2xl shadow-teal-900/10 ${
            showFloatingButton ? "bottom-24 right-4 sm:right-5" : "bottom-20 right-4 sm:right-5"
          }`}
          role="dialog"
          aria-label="Ashvay"
        >
          <header
            className="shrink-0 px-3 py-3 flex items-start justify-between gap-2 rounded-t-2xl text-white"
            style={{ background: GRADIENT }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center overflow-hidden ring-2 ring-white/40 shrink-0 shadow-md">
                <img src={ASHVAY_LOGO} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-[15px] leading-tight tracking-tight">Ashvay</h2>
                <p className="text-[11px] text-white/90 mt-0.5 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_#6ee7b7]" />
                  Online · CRM assistant
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/15 transition-colors text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="px-2.5 pt-2 pb-1 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Quick actions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map(({ icon: Icon, label, q }) => (
                <button
                  key={label}
                  type="button"
                  disabled={sending}
                  onClick={() => sendText(q)}
                  className="flex flex-col items-center justify-center w-[52px] h-[52px] rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 transition-colors disabled:opacity-50"
                  title={label}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-medium leading-none text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-3 bg-[#f6faf9]" style={{ WebkitOverflowScrolling: "touch" }}>
            {!hasThread && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[11px] text-slate-500 mb-1 flex items-center gap-1.5">
                  <img src={ASHVAY_LOGO} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span>Ashvay · {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </p>
                <p className="text-[13px] text-slate-800 leading-snug">
                  Hi <span className="font-semibold text-teal-800">{displayName}</span>, I&apos;m your personal assistant.
                  How can I help you today?
                </p>
                <p className="text-[12px] text-slate-600 mt-2">I can help with:</p>
                <ul className="text-[12px] text-slate-600 mt-1 list-disc list-inside space-y-0.5">
                  <li>Leads &amp; pipeline</li>
                  <li>Follow-ups &amp; reminders</li>
                  <li>Enquiries, calls &amp; quotations</li>
                </ul>
              </div>
            )}

            {thread.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.sender === "ashvay" && (
                  <div className="rounded-full w-7 h-7 flex-shrink-0 overflow-hidden ring-1 ring-teal-200 bg-white">
                    <img src={ASHVAY_LOGO} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 max-w-[88%] text-[13px] leading-snug ${
                    msg.sender === "user"
                      ? "text-white rounded-tr-sm shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm"
                  }`}
                  style={msg.sender === "user" ? { background: GRADIENT } : undefined}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.sender === "user" ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.sender === "user" && (
                  <div
                    className="rounded-full w-7 h-7 flex-shrink-0 text-white text-[10px] font-bold flex items-center justify-center bg-slate-400"
                    title={displayName}
                  >
                    {userAvatarGlyph(displayName)}
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-9">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                Soch raha hoon…
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="px-2.5 py-2 border-t border-slate-100 bg-white shrink-0 max-h-[140px] overflow-y-auto">
            <p className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Tap a question to continue
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={sending}
                  onClick={() => sendText(q)}
                  className="text-left text-[11px] font-medium px-3 py-1.5 rounded-full border border-slate-200 bg-[#f6faf9] text-teal-800 hover:bg-teal-50 hover:border-teal-300 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-2.5 border-t border-slate-200 bg-white shrink-0 space-y-1.5"
          >
            <div className="flex items-end gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 min-w-0 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 text-[13px] outline-none placeholder:text-slate-400 border border-slate-200 focus:ring-2 focus:ring-teal-500/35 focus:border-teal-400"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="rounded-xl p-2.5 text-white shadow-md disabled:opacity-40 transition-opacity shrink-0"
                style={{ background: GRADIENT }}
                aria-label="Send"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">Ashvay · ANOCAB CRM</p>
          </form>
        </div>
      )}
    </>
  )
}
