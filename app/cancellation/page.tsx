import PolicyLayout from '@/components/user/policy-layout';

export const metadata = {
  title: 'Cancellation & Refund Policy | Gembu Express',
  description:
    'Cancellation and Rescheduling Policy for Gembu Express luxury transport',
};

export default function CancellationPage() {
  return (
    <PolicyLayout
      title="Cancellation & Rescheduling Policy"
      effectiveDate="October 2025"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            1. Overview
          </h2>
          <p className="text-slate-700 leading-relaxed">
            At 8 Star Luxury Travel & Tour, we understand that travel plans can
            change. This policy explains how cancellations, refunds, and
            rescheduling requests are handled to ensure fairness for both our
            valued passengers and our operations team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            2. Passenger Cancellations
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            If you need to cancel your booking, please do so as early as
            possible to qualify for a refund. Refunds are subject to the
            timeline below:
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">
                    Time Before Departure
                  </th>
                  <th className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-900">
                    Refund Eligibility
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    More than 48 hours
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    90% refund (10% processing fee applies)
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    24–48 hours
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    50% refund
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    Less than 24 hours
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    Non-refundable
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    No-show (without notice)
                  </td>
                  <td className="border border-slate-300 px-4 py-2 text-slate-700">
                    Non-refundable
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-slate-700 leading-relaxed">
            Refunds will be processed within 5–7 working days after
            confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            3. Passenger Rescheduling
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We allow flexible rescheduling to accommodate your plans.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>
              You may reschedule once without penalty if done at least 48 hours
              before departure.
            </li>
            <li>
              Rescheduling within less than 48 hours will attract a 20%
              rebooking fee.
            </li>
            <li>
              Any difference in fare between the original and new trip will
              apply.
            </li>
            <li>Once rescheduled, the booking becomes non-refundable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            4. Company Cancellations or Changes
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            In rare cases (e.g., road closures, severe weather, mechanical
            issues, or safety concerns), 8 Star Luxury Travels & Tours may
            modify or cancel a trip.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            When this occurs:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>
              Passengers will be notified immediately via email, SMS, or
              WhatsApp.
            </li>
            <li>
              You will be offered a free reschedule or a full refund, depending
              on your preference.
            </li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Your safety and comfort remain our top priorities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            5. Add-On Services
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Add-on services such as hotel arrangements, tour packages, and
            excess luggage may involve third-party providers.
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>
              Cancellations within less than 24 hours may forfeit the add-on fee
              if the partner has already confirmed the service.
            </li>
            <li>
              Each partner&apos;s policy will apply for refunds and date
              changes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            6. How to Cancel or Reschedule
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            To cancel or reschedule your booking, contact our support team
            through:
          </p>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-slate-700">
              <strong>Email:</strong> support@8starluxury.com
            </p>
            <p className="text-slate-700 mt-2">
              <strong>Phone:</strong> +234 9027254731
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            7. Exceptional Circumstances
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We may, at our discretion, provide partial or full refunds in
            exceptional cases such as:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
            <li>Verified medical emergencies</li>
            <li>Bereavement of an immediate family member</li>
            <li>
              Travel disruptions caused by government restrictions or partner
              flight delays
            </li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Supporting documentation may be required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            8. Policy Updates
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We may update this policy periodically to improve service delivery
            and comply with new regulations. The latest version will always be
            available on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            9. Acceptance
          </h2>
          <p className="text-slate-700 leading-relaxed">
            By completing a booking on our platform, you acknowledge that you
            have read and agreed to this Cancellation & Rescheduling Policy.
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
}
