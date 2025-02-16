import LegalLayout from '../components/LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="25 November 2024">
      <p>
        Welcome to Hell&apos;s Kitchen! We provide a cloud-based platform (Platform) where you can create images and videos by leveraging our generative AI, train your own AI models among many other things.
      </p>
      
      <p>
        In these Terms, when we say you or your, we mean both you and any entity you are authorised to represent (such as your employer). When we say we, us, or our, we mean Evo Growth LLC.
      </p>

      <div className="bg-amber-50 p-6 rounded-lg my-8">
        <h2 className="text-2xl font-bold mb-4">Our Disclosures</h2>
        <p className="mb-4">Please read these Terms carefully before you accept. We draw your attention to:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>our privacy policy (on our website) which sets out how we will handle your personal information;</li>
          <li>clause 1.3 (Variations) which sets out how we may amend these Terms;</li>
          <li>clause 4 (Subscription) which sets out important information about your Subscription;</li>
          <li>clause 7 (Disclaimers regarding AI generated content) which sets out our disclaimers;</li>
          <li>clause 12 (Liability) which sets out exclusions and limitations to our liability.</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. Engagement and Term</h2>
      <div className="space-y-4">
        <p>
          1.1 These Terms apply from when you sign up for an Account, until the date on which your Account is terminated in accordance with these Terms. We grant you a right to use our Services for this period of time only.
        </p>
        <p>
          1.2 If you are under the age of 18, you have obtained the consent of your parents or guardian or supervision of a responsible adult to use our Platform.
        </p>
        <p>
          1.3 Variations: We may amend these Terms at any time, by providing written notice to you.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. Our Services</h2>
      <div className="space-y-4">
        <p>2.1 We provide the following services to you:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>access to our Platform;</li>
          <li>access to our troubleshooting support (Support Services)</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. Account</h2>
      <div className="space-y-4">
        <p>3.1 You must sign up for an Account in order to access and use our Services and Platform.</p>
        <p>
          3.2 Under a Teams Plan, you may invite Authorised Users to access and use our Services under your Account.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. Subscriptions</h2>
      <div className="space-y-4">
        <p>
          4.1 Once you have created your Account, you may choose a Subscription. The Subscriptions we offer will be set out on our Platform.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">5. Platform License</h2>
      <div className="space-y-4">
        <p>
          5.1 While you have an Account, we grant you and your Authorised Users a right to use our Platform.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">6. Availability and Downtime</h2>
      <div className="space-y-4">
        <p>
          6.1 While we strive to always make our Services available to you, we do not make any promises that these will be available 100% of the time.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">7. Disclaimer regarding Generative AI</h2>
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <p>
          7.1 Our Platform utilises generative AI and large language model technologies, which can produce content that may appear highly realistic or convincing, including text, images, audio, and video outputs (collectively, Generated Content).
        </p>
        <p>
          7.2 Subject to your Consumer Law Rights, the Generated Content is provided &quot;as is&quot; without warranties of any kind.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">8. Ownership of Inputs & Outputs</h2>
      <div className="space-y-4">
        <p>
          8.1 You may be permitted to submit text, documents, images, videos or other inputs to our Service (Inputs) and receive output generated and returned by the Services based on the Inputs (Outputs).
        </p>
      </div>

      {/* Additional sections continue with the same pattern */}
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
      <p>
        For questions about these Terms, or to get in touch with us, please email us.
      </p>
    </LegalLayout>
  );
}
