import { Zap, Shield, Clock, Users, Package, ArrowRight, Menu, X, Mail, Phone, Check, Building2 } from "lucide-react"
import { useState, useEffect } from "react"

const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"
const BENEFITS = [
  { icon: Clock, title: "Saves Time", desc: "Streamlined workflows from enquiry to delivery so your team spends less time on paperwork and more on business." },
  { icon: Zap, title: "Smooth Workflow", desc: "RFP to PI to production—everything in one place. Track orders, customers, and follow-ups without switching tools." },
  { icon: Shield, title: "Secure & Reliable", desc: "Your data stays safe. Role-based access and secure login so only the right people see the right information." },
]

const REAL_FEATURES = [
  {
    category: "Sales & Customers",
    icon: Users,
    features: [
      { title: "Customer Management", desc: "Manage customer details, contacts, and history in one place." },
      { title: "Leads & Follow-ups", desc: "Track leads and follow-ups so nothing slips through the cracks." },
      { title: "RFP & Quotes", desc: "Create and track RFPs and quotes through a clear workflow." },
      { title: "Proforma Invoice (PI)", desc: "Generate and manage PIs linked to orders and customers." },
    ],
  },
  {
    category: "Operations",
    icon: Package,
    features: [
      { title: "Production", desc: "Track production status and link it to orders and delivery." },
      { title: "IT & Support", desc: "Internal IT tickets and maintenance in one dashboard." },
      { title: "Ashvay — AI Assistant 24/7", desc: "AI assistant available 24/7 inside the app. Get quick answers and support anytime after login." },
      { title: "Departments & Roles", desc: "Organisation structure, departments, and role-based access." },
      { title: "Accounts & Payments", desc: "Payment info and account-related data in one system." },
    ],
  },
]

const SECURITY_POINTS = [
  { icon: Shield, title: "Secure Access", desc: "Role-based access so only authorised users use the system." },
  { icon: Building2, title: "Internal Only", desc: "Built for Anode Electric Pvt. Ltd." },
]

export default function AnocabLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeatureCategory, setActiveFeatureCategory] = useState(0)
  const [activeNav, setActiveNav] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "benefits", "features", "security", "contact"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveNav(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavigation = (path) => (window.location.href = path)
  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    section?.scrollIntoView({ behavior: "smooth", block: "start" })
    setMobileMenuOpen(false)
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero — logo + nav same page pe, no sticky, no separate bar */}
      <section id="hero" className="relative bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 pt-6 pb-20 lg:pt-8 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Logo + links — same page pe, no separate bar */}
          <div className="flex items-center justify-between mb-12 lg:mb-16">
            <div className="flex items-center gap-2">
              <img
                src={ANOCAB_LOGO}
                alt="Anocab"
                className="h-9 cursor-pointer object-contain mix-blend-multiply"
                onClick={() => handleNavigation("/")}
              />
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => scrollToSection("benefits")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeNav === "benefits" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-700 hover:text-blue-600"}`}
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeNav === "features" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-700 hover:text-blue-600"}`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("security")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeNav === "security" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-700 hover:text-blue-600"}`}
              >
                Security
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeNav === "contact" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-700 hover:text-blue-600"}`}
              >
                Contact
              </button>
              <div className="h-6 w-px bg-slate-300 mx-2" />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-500/25"
                onClick={() => handleNavigation("/login")}
              >
                Login
              </button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mb-8 py-4 border-t border-slate-200/80 space-y-2">
              <button onClick={() => scrollToSection("benefits")} className="block w-full text-left text-slate-700 hover:text-blue-600 py-2 text-sm font-medium">Benefits</button>
              <button onClick={() => scrollToSection("features")} className="block w-full text-left text-slate-700 hover:text-blue-600 py-2 text-sm font-medium">Features</button>
              <button onClick={() => scrollToSection("security")} className="block w-full text-left text-slate-700 hover:text-blue-600 py-2 text-sm font-medium">Security</button>
              <button onClick={() => scrollToSection("contact")} className="block w-full text-left text-slate-700 hover:text-blue-600 py-2 text-sm font-medium">Contact</button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold" onClick={() => handleNavigation("/login")}>Login</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/80 border border-blue-200/80 rounded-full text-blue-800 text-sm font-medium">
                <Building2 className="w-4 h-4" />
                <span>Internal company portal — Wire & Cable business</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                One place for your
                <br />
                <span className="text-blue-600">Wire & Cable</span> operations
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Customers, RFPs, quotes, PIs, production, and IT—all in one secure system. Built for internal use only, not for resale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/30"
                  onClick={() => handleNavigation("/login")}
                >
                  Login
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-6 pt-6 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-blue-600" />
                  Saves time
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-blue-600" />
                  Clear workflow
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-blue-600" />
                  Secure access
                </span>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center">
              <img src={ANOCAB_LOGO} alt="Anocab" className="w-full h-auto max-h-40 object-contain mx-auto mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits — Saves time, Workflow, Security */}
      <section id="benefits" className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why use this portal</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Reduces time, keeps workflow clear, and keeps your data secure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BENEFITS.map((item, i) => {
              const IconComponent = item.icon
              return (
                <div
                  key={i}
                  className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 rounded-xl p-8 text-center hover:border-blue-200 transition-colors"
                >
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features — only what exists */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {REAL_FEATURES.map((category, i) => {
              const IconComponent = category.icon
              return (
                <button
                  key={i}
                  onClick={() => setActiveFeatureCategory(i)}
                  className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    activeFeatureCategory === i ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-200"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.category}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REAL_FEATURES[activeFeatureCategory].features.map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-200 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Secure & internal</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              For your company only. No selling, no external use.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {SECURITY_POINTS.map((item, i) => {
              const IconComponent = item.icon
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact — minimal, internal */}
      <section id="contact" className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Need help?</h2>
            <p className="text-slate-600">Reach out if you need access or have questions.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>admin@anocab.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <span>+91 6262002182</span>
            </div>
          </div>
          <div className="mt-10 text-center">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/25"
              onClick={() => handleNavigation("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
