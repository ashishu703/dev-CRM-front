import { Star, Target, Zap, Globe, BarChart3, Headphones, Plug, ChevronDown, ChevronUp, Mail, Phone, MapPin } from "lucide-react"
import { useState } from "react"
import AshvayChat from "../components/AshvayChat"

const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"
const TRUSTED_BRANDS = [
  { name: "Raintree", logo: "https://logo.clearbit.com/raintreehotels.com" },
  { name: "Abu Dhabi Airlines", logo: "https://logo.clearbit.com/etihad.com" },
  { name: "Suzuki", logo: "https://logo.clearbit.com/suzuki.com" },
  { name: "Hotstar", logo: "https://logo.clearbit.com/hotstar.com" },
  { name: "IIFL", logo: "https://logo.clearbit.com/iifl.com" },
  { name: "Netflix", logo: "https://logo.clearbit.com/netflix.com" },
  { name: "PropertyGuru", logo: "https://logo.clearbit.com/propertyguru.com" },
  { name: "OLA", logo: "https://logo.clearbit.com/olacabs.com" },
]

const CRM_FEATURES = [
  { icon: "🎯", title: "Get a 360 degree view of your customers." },
  { icon: "🔍", title: "Identify and track high-value opportunities." },
  { icon: "⚡", title: "Automate your sales and marketing workflows." },
  { icon: "📈", title: "Convert leads into loyal customers faster." },
  { icon: "🌍", title: "Manage customer interactions across all channels." },
]

const STATS = [
  { number: "350%", label: "Increase in lead conversion." },
  { number: "45%", label: "Average revenue growth." },
  { number: "60%", label: "Improvement in customer retention." },
  { number: "50%", label: "Reduction in sales cycles." },
  { number: "35%", label: "Cost savings vs competitors." },
]

const FEATURES = [
  { icon: Target, title: "Smart Lead Management", desc: "Capture, nurture, and convert quality leads into customers. Get complete visibility into every customer interaction in one centralized dashboard." },
  { icon: Zap, title: "Intelligent Automation", desc: "Automate repetitive tasks and workflows so your team focuses on closing deals and building relationships instead of administrative work." },
  { icon: Globe, title: "Omnichannel Engagement", desc: "Connect with customers across email, phone, chat, and social media. Deliver consistent, personalized experiences at every touchpoint." },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Get real-time insights and predictive analytics to make data-driven decisions and identify growth opportunities." },
  { icon: Headphones, title: "24/7 World-Class Support", desc: "Our dedicated support team is available round-the-clock to help you succeed. Get expert guidance whenever you need it." },
  { icon: Plug, title: "Seamless Integration", desc: "Connect Anocab with 500+ business tools and applications. Create a unified tech stack that works for your business." },
]

const FAQS = [
  {
    question: "What is Anocab and how does it work?",
    answer: "Anocab is a comprehensive Customer Relationship Management (CRM) platform designed to help businesses build lasting customer relationships. It provides tools for lead management, customer engagement, sales automation, and analytics to help you connect better, manage smarter, and grow faster."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes! We offer a free trial so you can experience all the features of Anocab before making a commitment. Sign up today and start your free trial - no credit card required."
  },
  {
    question: "What are the different pricing plans?",
    answer: "We offer three main plans: Standard ($12/user/month) for small businesses, Premium ($29/user/month) for growing teams with advanced features, and Custom pricing for enterprises with specific requirements. All plans include our core CRM features."
  },
  {
    question: "Can I integrate Anocab with other business tools?",
    answer: "Absolutely! Anocab offers seamless integration with 500+ business tools and applications. This includes email platforms, accounting software, marketing tools, and more. Our API access is available in Premium and Custom plans."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We provide 24/7 world-class support across all plans. Standard plan includes email support, while Premium and Custom plans include priority support with faster response times. Our dedicated support team is always ready to help you succeed."
  },
  {
    question: "Is my data secure with Anocab?",
    answer: "Security is our top priority. We use enterprise-grade encryption, regular security audits, and comply with industry standards to ensure your data is safe and secure. We also offer on-premise deployment options for Custom plans."
  },
  {
    question: "Can I customize Anocab for my business needs?",
    answer: "Yes! Our Custom plan offers extensive customization options including custom features development, white-label options, and tailored workflows. Our team works closely with you to create a solution that perfectly fits your business."
  },
  {
    question: "How do I get started?",
    answer: "Getting started is easy! Simply click the 'Get Started' button, sign up for your free trial, and you'll be guided through a quick setup process. Our onboarding team is also available to help you get up and running quickly."
  }
]

export default function AnocabLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleNavigation = (path) => window.location.href = path
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section')
    pricingSection?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section')
    contactSection?.scrollIntoView({ behavior: 'smooth' })
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
    // Here you would typically send the form data to your backend
    console.log('Contact form submitted:', contactForm)
    setFormSubmitted(true)
    setContactForm({ name: "", email: "", company: "", phone: "", message: "" })
    setTimeout(() => setFormSubmitted(false), 5000)
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <img
            src={ANOCAB_LOGO}
            alt="Anocab Logo"
            width={120}
            height={48}
            className="object-contain cursor-pointer w-24 sm:w-32"
            onClick={() => handleNavigation('/')}
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center">
          <button className="rounded-full bg-transparent border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base hover:bg-gray-50 transition-colors" onClick={scrollToPricing}>
            Pricing
          </button>
          <button 
            className="rounded-full bg-transparent border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base hover:bg-gray-50 transition-colors"
            onClick={() => {
              const faqSection = document.getElementById('faq-section')
              faqSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            FAQs
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base transition-colors"
            onClick={() => handleNavigation('/login')}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 leading-tight">
              BUILD LASTING
              <br />
              CUSTOMER
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl">
                RELATIONSHIPS
                <br />
                with Anocab
              </span>
            </h1>
            <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
              Anocab helps businesses build meaningful customer relationships. Connect better, manage smarter, and grow
              faster with our intelligent customer relationship management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start pt-2 sm:pt-4">
              <button 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-base sm:text-lg transition-colors w-full sm:w-auto"
                onClick={() => handleNavigation('/login')}
              >
                Get Started
              </button>
              <span className="text-xs sm:text-sm text-gray-600">with your free trial</span>
            </div>
          </div>

          {/* Right - Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-200 to-cyan-100 rounded-3xl flex items-center justify-center shadow-lg">
              <img src={ANOCAB_LOGO} alt="Anocab" width={220} height={220} className="object-contain w-32 sm:w-40 lg:w-52" />
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="bg-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600 text-center mb-6 sm:mb-8 font-semibold text-sm sm:text-base">Trusted by leading companies worldwide</p>
          <div className="flex justify-center items-center flex-wrap gap-4 sm:gap-6">
            {TRUSTED_BRANDS.map((brand) => (
              <div key={brand.name} className="flex items-center justify-center">
                <img
                  src={brand.logo}
                  alt={`${brand.name} Logo`}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="object-contain rounded-full w-12 h-12 sm:w-16 sm:h-16"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="bg-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="space-y-4 text-center lg:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto lg:mx-0">
              <span className="text-3xl sm:text-4xl">🏆</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Industry Leading
              <br />
              CRM Platform
            </h3>
            <p className="text-gray-700 text-sm sm:text-base">
              Anocab has earned recognition as a trusted CRM solution, valued by thousands of businesses for driving
              measurable results and long-term growth.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 sm:p-8 rounded-lg">
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900">Highly rated by customers</h4>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-900">4.8 out of 5</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 mt-4 text-center lg:text-left">Based on 2000+ customer reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Benefits Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">How Anocab Empowers Your Business</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              {CRM_FEATURES.map((item, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 items-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-300 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg sm:text-xl">{item.icon}</span>
                  </div>
                  <p className="text-white font-semibold text-base sm:text-lg">{item.title}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-blue-900 rounded-lg p-4 sm:p-6 text-white space-y-2 sm:space-y-3">
                  <p className="text-3xl sm:text-4xl font-bold text-yellow-300">{stat.number}</p>
                  <p className="text-xs sm:text-sm font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white text-center text-xs sm:text-sm">
            * Results based on customer implementations and case studies.
          </p>
        </div>
      </section>

      {/* Why Choose Anocab Section */}
      <section className="bg-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Why Choose Anocab</h2>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            Anocab is engineered for modern businesses that demand powerful features, intuitive design, and exceptional
            support. From lead management to customer retention, we provide everything you need to build relationships
            that matter.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((feature, i) => {
              const IconComponent = feature.icon
              return (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">{feature.title}</h4>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing-section" className="bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-700 text-base sm:text-lg">Select the perfect plan for your business needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Standard Plan */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-blue-300 transform hover:scale-105 transition-transform">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Standard</h3>
                  <p className="text-gray-700 text-xs sm:text-sm">Perfect for small businesses</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-700">
                    $12
                    <span className="text-base sm:text-lg text-gray-600">/user/month</span>
                  </p>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Up to 100 contacts</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Basic lead management</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Email support</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Mobile app access</span>
                  </li>
                </ul>
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                  onClick={() => handleNavigation('/login')}
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-purple-400 transform hover:scale-105 transition-transform relative">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 sm:px-6 py-1 rounded-full text-xs sm:text-sm font-bold">
                Most Popular
              </div>
              <div className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-700 text-xs sm:text-sm">Ideal for growing teams</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-purple-700">
                    $29
                    <span className="text-base sm:text-lg text-gray-600">/user/month</span>
                  </p>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Unlimited contacts</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Advanced lead management</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Advanced analytics & reports</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Workflow automation</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                  onClick={() => handleNavigation('/login')}
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Customization Plan */}
            <div className="bg-gradient-to-br from-orange-100 to-yellow-200 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-orange-300 transform hover:scale-105 transition-transform md:col-span-2 lg:col-span-1">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Customization</h3>
                  <p className="text-gray-700 text-xs sm:text-sm">Tailored for enterprises</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-orange-700">
                    Custom
                    <span className="text-base sm:text-lg text-gray-600 block mt-1">Pricing</span>
                  </p>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Custom features development</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>White-label options</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>On-premise deployment</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Training & onboarding</span>
                  </li>
                </ul>
                <button 
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"
                  onClick={scrollToContact}
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-section" className="bg-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-gray-700 text-base sm:text-lg">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Information</h3>
                <p className="text-gray-700 text-sm sm:text-base">Fill out the form or reach out to us directly using the contact information below.</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Email</h4>
                    <p className="text-gray-700 text-sm sm:text-base">info@anocab.com</p>
                    <p className="text-gray-700 text-sm sm:text-base">support@anocab.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Phone</h4>
                    <p className="text-gray-700 text-sm sm:text-base">+1 (555) 123-4567</p>
                    <p className="text-gray-700 text-sm sm:text-base">+1 (555) 987-6543</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Address</h4>
                    <p className="text-gray-700 text-sm sm:text-base">123 Business Street, Suite 100</p>
                    <p className="text-gray-700 text-sm sm:text-base">City, State 12345, Country</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 sm:p-8 border-2 border-blue-200">
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={contactForm.company}
                      onChange={handleContactFormChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactFormChange}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {formSubmitted && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">Thank you! Your message has been sent. We'll get back to you soon.</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq-section" className="bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-700 text-base sm:text-lg">Find answers to common questions about Anocab</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {FAQS.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border-2 border-blue-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-900 pr-3 sm:pr-4">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Ready to Transform Your Customer Relationships?</h2>
          <p className="text-blue-100 text-base sm:text-lg">
            Join thousands of businesses growing with Anocab. Start your free trial today.
          </p>
          <button 
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-base sm:text-lg transition-colors"
            onClick={() => handleNavigation('/login')}
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Ashvay Chat Component */}
      <AshvayChat />
    </div>
  )
}
