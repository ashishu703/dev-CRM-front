import { Star, Target, Zap, Globe, BarChart3, Headphones, Plug, ChevronDown, ChevronUp, Mail, Phone, MapPin, Check, ArrowRight, Award, TrendingUp, Users, Shield, Lock, Database, Settings, FileText, HelpCircle, Menu, X, Play, Building2, Briefcase, LineChart, Clock, CheckCircle2, BarChart, PieChart, MessageSquare, Calendar, Bell, Search, Filter, Download, Upload, Eye, Edit, Trash2, Plus, Minus } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import AshvayChat from "../components/AshvayChat"

const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"

const TRUST_INDICATORS = [
  { label: "10M+", sublabel: "Users Worldwide" },
  { label: "50K+", sublabel: "Companies" },
  { label: "99.9%", sublabel: "Uptime SLA" },
  { label: "150+", sublabel: "Countries" },
]

const BUSINESS_OUTCOMES = [
  { metric: "45%", label: "Increase in Sales Productivity", icon: TrendingUp },
  { metric: "60%", label: "Faster Deal Closure", icon: Clock },
  { metric: "35%", label: "Reduction in Sales Cycle", icon: BarChart },
  { metric: "50%", label: "Improvement in Lead Conversion", icon: Target },
]

const ENTERPRISE_FEATURES = [
  {
    category: "Sales Management",
    icon: Briefcase,
    features: [
      { title: "Pipeline Management", desc: "Visualize and manage your entire sales pipeline with drag-and-drop stages" },
      { title: "Forecasting & Analytics", desc: "AI-powered forecasting with real-time sales analytics and reporting" },
      { title: "Activity Tracking", desc: "Automatically track calls, emails, meetings, and customer interactions" },
      { title: "Deal Management", desc: "Manage complex deals with multiple stakeholders and approval workflows" },
    ]
  },
  {
    category: "Lead Management",
    icon: Target,
    features: [
      { title: "Lead Capture", desc: "Capture leads from multiple channels including web forms, email, and social media" },
      { title: "Lead Scoring", desc: "Automatically score and prioritize leads based on behavior and engagement" },
      { title: "Lead Routing", desc: "Intelligent lead assignment based on territory, workload, and expertise" },
      { title: "Conversion Tracking", desc: "Track lead-to-customer conversion rates with detailed analytics" },
    ]
  },
  {
    category: "Contact & Account Management",
    icon: Users,
    features: [
      { title: "360° Customer View", desc: "Complete customer profile with interaction history, preferences, and insights" },
      { title: "Account Hierarchy", desc: "Manage complex account structures with parent-child relationships" },
      { title: "Contact Segmentation", desc: "Segment contacts by industry, behavior, value, and custom criteria" },
      { title: "Relationship Mapping", desc: "Visualize relationships between contacts, accounts, and opportunities" },
    ]
  },
  {
    category: "Automation & Workflows",
    icon: Zap,
    features: [
      { title: "Workflow Automation", desc: "Automate repetitive tasks with visual workflow builder and triggers" },
      { title: "Email Automation", desc: "Send personalized emails at scale with drip campaigns and templates" },
      { title: "Task Automation", desc: "Automatically create tasks, reminders, and follow-ups based on rules" },
      { title: "Process Automation", desc: "Streamline business processes with approval workflows and notifications" },
    ]
  },
  {
    category: "Analytics & Reporting",
    icon: BarChart3,
    features: [
      { title: "Custom Dashboards", desc: "Build personalized dashboards with drag-and-drop widgets and real-time data" },
      { title: "Advanced Reports", desc: "Create custom reports with filters, grouping, and scheduled delivery" },
      { title: "Predictive Analytics", desc: "AI-powered insights to predict sales outcomes and identify opportunities" },
      { title: "Data Export", desc: "Export data in multiple formats with custom field selection and scheduling" },
    ]
  },
  {
    category: "Integration & API",
    icon: Plug,
    features: [
      { title: "500+ Integrations", desc: "Connect with email, accounting, marketing, support, and productivity tools" },
      { title: "REST API", desc: "Build custom integrations with comprehensive REST API and webhooks" },
      { title: "Data Sync", desc: "Real-time bidirectional sync with your existing business applications" },
      { title: "Custom Apps", desc: "Build custom applications using our platform APIs and SDKs" },
    ]
  },
]

const SECURITY_FEATURES = [
  { icon: Shield, title: "SOC 2 Type II Certified", desc: "Regular audits ensure enterprise-grade security" },
  { icon: Lock, title: "End-to-End Encryption", desc: "AES-256 encryption for data at rest and in transit" },
  { icon: Database, title: "99.9% Uptime SLA", desc: "Redundant infrastructure with guaranteed availability" },
  { icon: CheckCircle2, title: "GDPR & HIPAA Compliant", desc: "Meet regulatory requirements across industries" },
]

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "VP of Sales",
    company: "TechCorp Global",
    companySize: "5,000+ employees",
    text: "Anocab CRM transformed our sales organization. We've increased revenue by 45% and reduced our sales cycle by 30% in just 6 months.",
    metrics: "45% revenue increase, 30% faster sales cycle"
  },
  {
    name: "David Chen",
    role: "Chief Revenue Officer",
    company: "Growth Solutions Inc.",
    companySize: "2,000+ employees",
    text: "The automation capabilities and analytics in Anocab have been game-changers. Our team productivity has increased significantly.",
    metrics: "60% productivity improvement"
  },
  {
    name: "Emily Rodriguez",
    role: "Director of Customer Success",
    company: "Digital Ventures",
    companySize: "1,000+ employees",
    text: "The 360° customer view and integration capabilities make it easy to deliver exceptional customer experiences at scale.",
    metrics: "50% improvement in customer satisfaction"
  },
]

const FAQS = [
  {
    question: "What makes Anocab CRM different from other enterprise CRMs?",
    answer: "Anocab combines powerful enterprise features with intuitive design. We offer 500+ integrations, AI-powered analytics, and unlimited customization while maintaining 99.9% uptime. Our platform scales from startups to Fortune 500 companies without compromising performance or security."
  },
  {
    question: "How secure is my data with Anocab?",
    answer: "Security is our foundation. We're SOC 2 Type II certified, use AES-256 encryption, conduct regular security audits, and maintain compliance with GDPR, HIPAA, and other industry standards. Your data is stored in redundant, geographically distributed data centers with 24/7 monitoring."
  },
  {
    question: "Can Anocab scale with my business?",
    answer: "Absolutely. Anocab is built on cloud-native architecture that scales automatically. We support organizations from 10 users to 100,000+ users. Our infrastructure handles millions of records, thousands of concurrent users, and processes billions of API calls monthly without performance degradation."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer 24/7 support across all plans. Standard includes email support with 24-hour response time. Premium includes priority email, chat, and phone support with 4-hour response time. Enterprise includes dedicated account management, 1-hour response time, and custom onboarding and training programs."
  },
  {
    question: "How long does implementation take?",
    answer: "Implementation time varies based on complexity. Simple setups can be completed in 1-2 weeks. Enterprise deployments with custom configurations typically take 4-8 weeks. We provide dedicated implementation specialists and comprehensive migration tools to ensure smooth transitions."
  },
  {
    question: "Can I migrate from my current CRM?",
    answer: "Yes, we provide free data migration assistance for all plans. Our team handles imports from Salesforce, HubSpot, Zoho, Microsoft Dynamics, and other major CRMs. We migrate contacts, accounts, deals, activities, and custom data with validation and testing to ensure accuracy."
  },
  {
    question: "What integrations are available?",
    answer: "Anocab integrates with 500+ business applications including email (Gmail, Outlook), accounting (QuickBooks, Xero, NetSuite), marketing (HubSpot, Marketo, Mailchimp), support (Zendesk, Freshdesk), productivity (Slack, Microsoft 365, Google Workspace), and many more. Our REST API enables custom integrations."
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes, we offer native mobile apps for iOS and Android with full feature parity. The apps support offline mode, push notifications, document access, and all core CRM functions. Mobile apps are included with all plans at no additional cost."
  },
]

export default function AnocabLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeatureCategory, setActiveFeatureCategory] = useState(0)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    companySize: ""
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [activeNav, setActiveNav] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'outcomes', 'security', 'testimonials', 'pricing', 'faq', 'contact']
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

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (path) => window.location.href = path
  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileMenuOpen(false)
  }

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const handleContactFormChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    console.log('Contact form submitted:', contactForm)
    setFormSubmitted(true)
    setContactForm({ name: "", email: "", company: "", phone: "", message: "", companySize: "" })
    setTimeout(() => setFormSubmitted(false), 5000)
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src={ANOCAB_LOGO}
                alt="Anocab CRM"
                className="h-8 cursor-pointer"
                onClick={() => handleNavigation('/')}
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              <button 
                onClick={() => scrollToSection('features')} 
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeNav === 'features' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('outcomes')} 
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeNav === 'outcomes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Outcomes
              </button>
              <button 
                onClick={() => scrollToSection('security')} 
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeNav === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Security
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeNav === 'pricing' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeNav === 'contact' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Contact
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              <button 
                className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors"
                onClick={() => handleNavigation('/login')}
              >
                Login
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-semibold transition-colors ml-2"
                onClick={() => scrollToSection('pricing')}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-700 hover:text-blue-600 py-2 text-sm font-medium">
                Features
              </button>
              <button onClick={() => scrollToSection('outcomes')} className="block w-full text-left text-gray-700 hover:text-blue-600 py-2 text-sm font-medium">
                Outcomes
              </button>
              <button onClick={() => scrollToSection('security')} className="block w-full text-left text-gray-700 hover:text-blue-600 py-2 text-sm font-medium">
                Security
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-700 hover:text-blue-600 py-2 text-sm font-medium">
                Pricing
              </button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-gray-700 hover:text-blue-600 py-2 text-sm font-medium">
                Contact
              </button>
              <div className="pt-4 space-y-2 border-t border-gray-200">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold"
                  onClick={() => handleNavigation('/login')}
                >
                  Login
                </button>
                <button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded text-sm font-semibold"
                  onClick={() => scrollToSection('pricing')}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Trusted by 50,000+ companies worldwide</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.2]">
                Enterprise CRM
                <br />
                Built for <span className="text-blue-600">Scale</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Manage millions of contacts, automate complex workflows, and drive revenue growth with the CRM platform trusted by Fortune 500 companies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  onClick={() => scrollToSection('pricing')}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-base transition-colors flex items-center justify-center gap-2"
                  onClick={() => scrollToSection('contact')}
                >
                  <Play className="w-5 h-5" />
                  Request Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
                {TRUST_INDICATORS.map((indicator, i) => (
                  <div key={i}>
                    <p className="text-2xl font-bold text-gray-900">{indicator.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{indicator.sublabel}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 shadow-lg">
                <img src={ANOCAB_LOGO} alt="Anocab CRM Dashboard" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Outcomes */}
      <section id="outcomes" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Proven Business Outcomes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Organizations using Anocab CRM see measurable improvements in sales performance and operational efficiency
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BUSINESS_OUTCOMES.map((outcome, i) => {
              const IconComponent = outcome.icon
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">{outcome.metric}</p>
                  <p className="text-gray-600">{outcome.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive CRM capabilities designed for large-scale organizations
            </p>
          </div>

          {/* Feature Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-gray-200 pb-4">
            {ENTERPRISE_FEATURES.map((category, i) => {
              const IconComponent = category.icon
              return (
                <button
                  key={i}
                  onClick={() => setActiveFeatureCategory(i)}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    activeFeatureCategory === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.category}
                </button>
              )
            })}
          </div>

          {/* Active Feature Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ENTERPRISE_FEATURES[activeFeatureCategory].features.map((feature, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Security & Compliance</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your data security is our top priority. Built to meet the highest enterprise standards.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SECURITY_FEATURES.map((feature, i) => {
              const IconComponent = feature.icon
              return (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-gray-600">See how enterprises are transforming with Anocab CRM</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="border-t border-gray-200 pt-6">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500 mt-1">{testimonial.company} • {testimonial.companySize}</p>
                  <p className="text-sm text-blue-600 font-medium mt-3">{testimonial.metrics}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise Pricing</h2>
            <p className="text-xl text-gray-600">Scalable plans designed for organizations of all sizes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Standard */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
              <p className="text-gray-600 mb-6">For growing businesses</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">$25</span>
                <span className="text-gray-600">/user/month</span>
                <p className="text-sm text-gray-500 mt-2">Billed annually</p>
              </div>
              <ul className="space-y-4 mb-8">
                {["Up to 10,000 contacts", "Basic pipeline management", "Email support", "Standard reports", "Mobile apps", "Basic integrations"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                className="w-full border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => handleNavigation('/login')}
              >
                Start Free Trial
              </button>
            </div>

            {/* Premium - Recommended */}
            <div className="bg-blue-600 border-2 border-blue-600 rounded-lg p-8 relative transform scale-105 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-1.5 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <p className="text-blue-100 mb-6">For established enterprises</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$65</span>
                <span className="text-blue-100">/user/month</span>
                <p className="text-sm text-blue-200 mt-2">Billed annually</p>
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited contacts", "Advanced pipeline & forecasting", "Priority support", "Advanced analytics", "Workflow automation", "500+ integrations", "API access", "Custom fields & objects"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                className="w-full bg-white text-blue-600 hover:bg-gray-100 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => handleNavigation('/login')}
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">For large organizations</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">Custom</span>
                <p className="text-gray-600 mt-2">Contact us for pricing</p>
              </div>
              <ul className="space-y-4 mb-8">
                {["Everything in Premium", "Dedicated account manager", "Custom development", "White-label options", "On-premise deployment", "Advanced security", "24/7 phone support", "Custom training"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                className="w-full border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => scrollToSection('contact')}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about Anocab CRM</p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4 text-lg">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-xl text-gray-600">
                  Speak with our enterprise sales team to discuss your requirements
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Email</p>
                    <p className="text-gray-600">sales@anocab.com</p>
                    <p className="text-gray-600">support@anocab.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-gray-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM EST</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company *</label>
                    <input
                      type="text"
                      name="company"
                      value={contactForm.company}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Company Size</label>
                    <select
                      name="companySize"
                      value={contactForm.companySize}
                      onChange={handleContactFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1,000 employees</option>
                      <option value="1000+">1,000+ employees</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleContactFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>
                {formSubmitted && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">Thank you! We'll contact you within 24 hours.</p>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Request Demo
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="hover:text-white transition-colors cursor-pointer">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQs</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">&copy; {new Date().getFullYear()} Anocab. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Ashvay Chat Component */}
      <AshvayChat />
    </div>
  )
}
