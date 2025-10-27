import PolicyLayout from '@/components/user/policy-layout';

export const metadata = {
  title: 'Terms of Service | Gembu Express',
  description:
    'Terms of Service for Gembu Express luxury transport booking platform',
};

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms of Service" effectiveDate="October 2025">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-slate-700 leading-relaxed">
            By accessing or using 8 Star Luxury Travel & Tour&apos; platform,
            you agree to comply with and be bound by these Terms of Service. If
            you do not agree, please do not use our website or services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            2. Services Provided
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            8 Star Luxury Travel & Tour (&ldquo;we,&ldquo; &ldquo;our,&ldquo; or
            &ldquo;us&ldquo;) provides luxury travel and tour booking services,
            including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Seat reservations and charter bookings</li>
            <li>Hotel and tour package add-ons</li>
            <li>Flight coordination services (through third-party partners)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            All bookings are subject to vehicle availability, payment
            confirmation, and our Cancellation & Rescheduling Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            3. Booking and Payment
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>
              All prices are listed in Nigerian Naira (₦) and are subject to
              change.
            </li>
            <li>Bookings are confirmed only after successful payment.</li>
            <li>
              Payments are processed securely via Paystack, Flutterwave, or
              other approved gateways.
            </li>
            <li>
              You are responsible for providing accurate passenger information.
            </li>
            <li>
              Fraudulent bookings or misuse of payment methods will lead to
              immediate cancellation and possible legal action.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            4. Cancellations and Refunds
          </h2>
          <p className="text-slate-700 leading-relaxed">
            All cancellations, reschedules, and refunds are governed by our
            Cancellation & Rescheduling Policy, available on our website.
            Refunds are processed within 5–7 business days after confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            5. Passenger Responsibilities
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            By booking with us, you agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>
              Arrive at the pickup point at least 30 minutes before departure.
            </li>
            <li>Present a valid booking reference & ID.</li>
            <li>Comply with all driver and safety instructions.</li>
            <li>Refrain from carrying prohibited or hazardous materials.</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            We reserve the right to deny boarding to any passenger under the
            influence of drugs or alcohol, or whose behavior endangers others.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            6. Company Rights
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We reserve the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>
              Modify routes, schedules, or vehicles in case of unforeseen
              circumstances.
            </li>
            <li>
              Cancel or reschedule trips for safety or operational reasons.
            </li>
            <li>
              Refuse service to passengers violating our terms or code of
              conduct.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            7. Liability Disclaimer
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            While we strive to provide safe and reliable service, 8 Star Luxury
            Travel & Tour will not be liable for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>
              Delays caused by weather, road conditions, or external events
              beyond our control.
            </li>
            <li>Loss of personal property during the trip.</li>
            <li>
              Indirect or consequential losses related to travel disruptions.
            </li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Our maximum liability, if proven, is limited to the cost of your
            ticket.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            8. Intellectual Property
          </h2>
          <p className="text-slate-700 leading-relaxed">
            All website content, designs, logos, and materials are the property
            of 8 Star Luxury Travel & Tour. You may not copy, modify, or
            distribute any part of our content without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            9. Data Protection
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We collect and process customer data in accordance with our Privacy
            Policy. By using our platform, you consent to our use of your
            information as described therein.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            10. Governing Law
          </h2>
          <p className="text-slate-700 leading-relaxed">
            These Terms are governed by the laws of the Federal Republic of
            Nigeria. Any disputes shall be resolved in Nigerian courts, with
            venue in Abuja.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            11. Contact Information
          </h2>
          <p className="text-slate-700 leading-relaxed">
            For questions or concerns about these Terms, contact us at:
          </p>
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
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
