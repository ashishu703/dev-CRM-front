const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"

export default function PrivacyPolicyPage() {
  const handleNavigation = (path) => {
    window.location.href = path
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <img
          src={ANOCAB_LOGO}
          alt="Anocab Logo"
          className="h-8 sm:h-9 object-contain cursor-pointer"
          onClick={() => handleNavigation("/")}
        />
        <button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => handleNavigation("/")}
        >
          Back to Home
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 lg:p-10 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Privacy Policy - Anocab App</h1>
          <p className="text-sm text-slate-600 mb-6"><strong>Effective Date:</strong> March 21, 2026</p>
          <p className="text-slate-700 mb-8">
            This Privacy Policy applies to the Anocab mobile application and website (anocabapp.com). By using our services, you agree to the collection and use of information in accordance with this policy.
          </p>

          <section className="space-y-6 text-slate-700">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Information We Collect</h2>
              <p className="mb-2">We may collect the following types of information:</p>
              <p className="font-medium">Personal Information:</p>
              <ul className="list-disc pl-6 mb-2">
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
              </ul>
              <p className="font-medium">KYC Information (Sensitive Data):</p>
              <ul className="list-disc pl-6 mb-2">
                <li>PAN Card Details</li>
                <li>Aadhaar Number (if required for verification)</li>
              </ul>
              <p className="font-medium">Usage Data:</p>
              <ul className="list-disc pl-6">
                <li>App usage activity</li>
                <li>Device information</li>
                <li>Transaction and reward history</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Purpose of Data Collection</h2>
              <p className="mb-2">We collect your information for the following purposes:</p>
              <ul className="list-disc pl-6">
                <li>User registration and authentication</li>
                <li>KYC verification for secure payouts</li>
                <li>Processing rewards and transactions</li>
                <li>Fraud prevention and security monitoring</li>
                <li>Improving our services</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Data Security</h2>
              <p className="mb-2">We implement appropriate security measures to protect your data:</p>
              <ul className="list-disc pl-6">
                <li>Encryption of sensitive data</li>
                <li>Secure servers and restricted access</li>
                <li>Regular monitoring for unauthorized access</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Data Sharing</h2>
              <p className="mb-2">We do <strong>not sell</strong> your personal data.</p>
              <p className="mb-2">We may share data only with:</p>
              <ul className="list-disc pl-6">
                <li>Payment gateways (for reward withdrawal)</li>
                <li>Verification services (for KYC validation)</li>
                <li>Legal authorities (if required by law)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">5. User Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 mb-2">
                <li>Request access to your data</li>
                <li>Request correction or deletion</li>
                <li>Delete your account anytime</li>
              </ul>
              <p>To request data deletion, contact us at: <strong>admin@anocab.in</strong></p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Data Retention</h2>
              <p className="mb-2">We retain your data only as long as necessary for:</p>
              <ul className="list-disc pl-6">
                <li>Legal compliance</li>
                <li>Fraud prevention</li>
                <li>Business operations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Third-Party Services</h2>
              <p className="mb-2">Our app may use third-party services for:</p>
              <ul className="list-disc pl-6 mb-2">
                <li>Payment processing</li>
                <li>Analytics</li>
                <li>KYC verification</li>
              </ul>
              <p>These services have their own privacy policies.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Children's Privacy</h2>
              <p>Our services are not intended for users under 18 years of age.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Updates will be posted on this page.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Contact Us</h2>
              <p>Email: admin@anocab.in</p>
              <p>Phone: +91 6262002116</p>
              <p>Website: https://anocabapp.com</p>
            </div>
          </section>
        </article>
      </main>
    </div>
  )
}
