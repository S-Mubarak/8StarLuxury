import PolicyLayout from '@/components/user/policy-layout';

export const metadata = {
  title: 'Privacy Policy | Gembu Express',
  description:
    'Privacy Policy for Gembu Express luxury transport booking platform',
};

export default function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy" effectiveDate="October 2025">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            1. Information We Collect
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We collect the following types of information to provide our
            services:
          </p>

          <h3 className="text-xl font-semibold text-slate-800 mb-3">
            Personal Information
          </h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mb-6">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>ID Number</li>
            <li>Nationality</li>
            <li>Gender</li>
            <li>Date of birth</li>
            <li>
              Payment details (processed securely via third-party gateways)
            </li>
            <li>Travel preferences and booking history</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-800 mb-3">
            Automatically Collected Data
          </h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>IP address</li>
            <li>Browser type and device information</li>
            <li>Cookies and analytics data (for improving site performance)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Process and confirm your bookings</li>
            <li>Communicate trip updates and reminders</li>
            <li>Provide customer support</li>
            <li>Improve our services and user experience</li>
            <li>Send promotional messages (only with your consent)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            We do not sell or rent your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            3. Data Sharing
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We may share limited data with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Payment processors (Paystack)</li>
            <li>Travel and hotel partners (for add-on services)</li>
            <li>Government authorities (when legally required)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            All partners are required to comply with strict confidentiality and
            data protection standards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            4. Data Retention
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We retain personal data only as long as necessary for service
            delivery and legal compliance, record keeping and audits. Afterward,
            data is securely deleted or anonymized.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            5. Cookies & Tracking
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Our website uses cookies to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Remember your preferences</li>
            <li>Track site performance and security</li>
            <li>Improve booking experience</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            You can disable cookies via your browser settings, but some site
            functions may not work properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            6. Data Security
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We implement industry-standard security measures, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>SSL encryption</li>
            <li>Secure cloud storage</li>
            <li>Access control and authentication for staff</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            However, no online platform is 100% secure. You share information at
            your own discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            7. Your Rights
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Under NDPR, you have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Access your personal data</li>
            <li>Request correction or deletion</li>
            <li>Withdraw consent for marketing</li>
            <li>
              Lodge a complaint with the Nigeria Data Protection Commission
              (NDPC)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            8. Updates to This Policy
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We may revise this Privacy Policy from time to time. The latest
            version will always be available on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            9. Contact Us
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            For inquiries or privacy-related requests:
          </p>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-slate-700">
              <strong>Email:</strong> support@8starluxury.com
            </p>
            <p className="text-slate-700 mt-2">
              <strong>Website:</strong> www.8starluxury.com/contact
            </p>
          </div>
        </section>
      </div>
    </PolicyLayout>
  );
}
