export default function BusinessCard5() {
    return (
      <div className="w-96 h-60 bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white text-sm font-bold tracking-wide">ANODE ELECTRICAL</h2>
            <p className="text-slate-300 text-xs italic">A Positive Connection...</p>
          </div>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anocab%20logo-rYdjhqizYkS1DyCh5gJRVHlm9PthZ6.png"
            alt="Anocab Logo"
            className="h-8 object-contain opacity-90"
            style={{ filter: "brightness(0.9) saturate(0.8)" }}
          />
        </div>
  
        {/* Main Content */}
        <div className="flex-1 px-6 py-4 flex items-center gap-4">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ABHAY-nuijcZUGrJNZtW6z7Hm6pmIb0FPILV.png"
            alt="Abhay Tiwari"
            className="w-16 h-16 rounded border-2 border-blue-600 object-cover flex-shrink-0"
          />
  
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Abhay Tiwari</h1>
            <p className="text-blue-600 font-semibold text-sm">Intern</p>
            <p className="text-xs text-slate-600 mt-1">Electrical Systems & Design</p>
          </div>
        </div>
  
        {/* Footer with Contact */}
        <div className="bg-slate-50 px-6 py-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3 text-xs text-slate-700">
            <div>
              <p className="font-semibold text-blue-600 text-xs">📧</p>
              <p className="text-xs text-slate-600 truncate">abhu9513@gmail.com</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600 text-xs">📱</p>
              <p className="text-xs text-slate-600">0000000000</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600 text-xs">📍</p>
              <p className="text-xs text-slate-600">Jabalpur, MP</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  