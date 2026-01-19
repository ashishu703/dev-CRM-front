import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, Upload } from "lucide-react"

const ASHVAY_LOGO = "https://res.cloudinary.com/dngojnptn/image/upload/v1764139419/ChatGPT_Image_Nov_26_2025_11_50_20_AM_qkwcqe.png"
const ASHVAY_GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 25%, #f59e0b 50%, #10b981 75%, #3b82f6 100%)'
const INITIAL_MESSAGE = {
  id: 1,
  sender: "ashvay",
  message: "Hello! I'm Ashvay, your AI assistant. How can I help you today?",
  timestamp: new Date()
}

export default function AshvayChat({ showFloatingButton = true }) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState("")
  const [image, setImage] = useState(null)
  const [chatMessages, setChatMessages] = useState([INITIAL_MESSAGE])
  const chatEndRef = useRef(null)
  const logoRef = useRef(null)
  const [position, setPosition] = useState({ x: null, y: null })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const mouseDownPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // Initialize position to bottom-right on mount
  useEffect(() => {
    if (position.x === null && position.y === null) {
      setPosition({ x: window.innerWidth - 100, y: window.innerHeight - 100 })
    }
  }, [position])

  // Handle window resize to keep logo within bounds
  useEffect(() => {
    const handleResize = () => {
      if (logoRef.current && position.x !== null && position.y !== null) {
        const logoRect = logoRef.current.getBoundingClientRect()
        const maxX = window.innerWidth - logoRect.width
        const maxY = window.innerHeight - logoRect.height
        
        setPosition(prev => ({
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY)
        }))
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [position])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    const currentX = position.x !== null ? position.x : (window.innerWidth - 100)
    const currentY = position.y !== null ? position.y : (window.innerHeight - 100)
    dragStartRef.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY
    }
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e) => {
    const logoRect = logoRef.current?.getBoundingClientRect()
    if (!logoRect) return

    const newX = e.clientX - dragStartRef.current.x
    const newY = e.clientY - dragStartRef.current.y
    
    // Keep logo within window bounds
    const maxX = window.innerWidth - logoRect.width
    const maxY = window.innerHeight - logoRect.height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }, [])

  const handleMouseUp = useCallback((e) => {
    setIsDragging(false)
    // Only open modal if it was a click (not a drag) - check if mouse moved less than 5px
    const moved = Math.abs(e.clientX - mouseDownPosRef.current.x) > 5 || 
                  Math.abs(e.clientY - mouseDownPosRef.current.y) > 5
    if (!moved) {
      setShowModal(true)
    }
  }, [])

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) setImage(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() && !image) return

    const userMessage = {
      id: Date.now(),
      sender: "user",
      message: message || "Image uploaded",
      timestamp: new Date(),
      image
    }
    setChatMessages(prev => [...prev, userMessage])

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "ashvay",
        message: "Thank you for sharing your issue. I'm processing your request and will get back to you shortly.",
        timestamp: new Date()
      }])
    }, 1000)

    setMessage("")
    setImage(null)
  }

  return (
    <>
      <button
        ref={logoRef}
        onMouseDown={handleMouseDown}
        className="fixed w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 overflow-hidden bg-white p-2 cursor-move"
        style={{
          left: position.x !== null ? `${position.x}px` : 'auto',
          top: position.y !== null ? `${position.y}px` : 'auto',
          right: position.x === null ? '32px' : 'auto',
          bottom: position.y === null ? '32px' : 'auto',
          userSelect: 'none'
        }}
      >
        <img src={ASHVAY_LOGO} alt="Ashvay" className="w-full h-full object-contain rounded-full pointer-events-none" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg overflow-hidden bg-white p-1">
                  <img src={ASHVAY_LOGO} alt="Ashvay" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Ashvay - AI Support</h3>
                  <p className="text-white/90 text-xs">24/7 Available</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area - Dark Background */}
            <div className="flex-1 bg-gradient-to-b from-slate-700 to-slate-800 p-4 overflow-y-auto">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {msg.sender === "ashvay" && (
                      <div className="rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 overflow-hidden bg-white p-0.5">
                        <img src={ASHVAY_LOGO} alt="Ashvay" className="w-full h-full object-contain rounded-full" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-3 max-w-[80%] ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 rounded-tr-sm"
                          : "bg-slate-600 rounded-tl-sm"
                      }`}
                    >
                      {msg.image && (
                        <div className="mb-2">
                          <img
                            src={URL.createObjectURL(msg.image)}
                            alt="Uploaded"
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      )}
                      <p className="text-sm text-white">{msg.message}</p>
                      <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-white/70" : "text-slate-400"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.sender === "user" && (
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">U</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-slate-700 p-4 space-y-2">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your issue..."
                    className="w-full bg-slate-600 text-white rounded-2xl px-4 py-3 pr-12 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500"
                  />
                  <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                    <Upload className="w-5 h-5 text-slate-400 hover:text-purple-400 transition-colors" />
                    <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" id="ashvay-image-upload" />
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full p-3 shadow-lg transition-all flex items-center justify-center"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
              {image && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="text-green-400">✓</span>
                  <span>{image.name}</span>
                </div>
              )}
              <p className="text-slate-400 text-xs text-center">
                Ashvay can help with common issues. For urgent matters, create a ticket.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

