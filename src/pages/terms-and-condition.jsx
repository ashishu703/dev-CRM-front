const ANOCAB_LOGO = "https://res.cloudinary.com/drpbrn2ax/image/upload/v1757416761/logo2_kpbkwm-removebg-preview_jteu6d.png"

export default function TermsAndConditionPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Terms & Conditions - Anocab App</h1>
          <p className="text-sm text-slate-600 mb-8"><strong>Effective Date:</strong> March 21, 2026</p>
          <p className="text-slate-700 mb-8">By using the Anocab App, you agree to the following terms:</p>

          <section className="space-y-6 text-slate-700">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Eligibility</h2>
              <ul className="list-disc pl-6">
                <li>Users must be at least 18 years old</li>
                <li>Users must provide accurate information</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Account Responsibility</h2>
              <ul className="list-disc pl-6">
                <li>You are responsible for maintaining account confidentiality</li>
                <li>Any activity under your account is your responsibility</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">3. KYC Verification</h2>
              <ul className="list-disc pl-6">
                <li>Users may be required to submit PAN/Aadhaar for verification</li>
                <li>Providing false information may lead to account suspension</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Rewards & Earnings</h2>
              <ul className="list-disc pl-6">
                <li>Users can earn rewards through eligible actions (e.g., scanning)</li>
                <li>Rewards are credited as points or balance</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Redemption Policy</h2>
              <ul className="list-disc pl-6">
                <li>Rewards can be redeemed via supported methods (UPI/Bank/etc.)</li>
                <li>Minimum withdrawal limit may apply</li>
                <li>Processing time may vary</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Fraud & Abuse</h2>
              <p className="mb-2">We strictly prohibit:</p>
              <ul className="list-disc pl-6 mb-2">
                <li>Fake accounts</li>
                <li>Multiple account abuse</li>
                <li>Manipulation of reward system</li>
              </ul>
              <p className="mb-2">Violation may result in:</p>
              <ul className="list-disc pl-6">
                <li>Account suspension</li>
                <li>Reward cancellation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Payment & Liability</h2>
              <ul className="list-disc pl-6">
                <li>We are not responsible for delays caused by payment providers</li>
                <li>Users must provide correct payment details</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Termination</h2>
              <p className="mb-2">We reserve the right to:</p>
              <ul className="list-disc pl-6">
                <li>Suspend or terminate accounts</li>
                <li>Remove rewards in case of violation</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Limitation of Liability</h2>
              <p className="mb-2">We are not liable for:</p>
              <ul className="list-disc pl-6">
                <li>Loss of data</li>
                <li>Technical issues</li>
                <li>Third-party failures</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use means acceptance.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">11. Contact</h2>
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
