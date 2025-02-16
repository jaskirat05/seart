import LegalLayout from '../components/LegalLayout';

export default function DmcaPolicy() {
  return (
    <LegalLayout title="DMCA Policy" lastUpdated="25 November 2024">
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-bold mb-4">Introduction & Explanation</h2>
        <p className="mb-6">
          Hellsk.com respect the intellectual property rights of others and expect its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond promptly to claims of copyright infringement committed using the hellsk.com website, its subdomain, or any associated services that are reported to our designated copyright agent.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Takedown Notice Instructions</h2>
        <p className="mb-4">
          If you are a copyright owner or an agent thereof, and you believe that any content hosted on our website (hellsk.com) infringes your copyrights, you may submit a notification pursuant to the DMCA by providing our designated copyright agent with the following information in writing:
        </p>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <ol className="list-decimal ml-6 space-y-3">
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled.</li>
            <li>Information reasonably sufficient to permit hellsk.com to contact you, such as an address, telephone number, and, if available, an email address.</li>
            <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          </ol>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Counter Notice Instructions</h2>
        <p className="mb-4">
          If you believe that your content was removed or disabled by mistake or misidentification, you may send a counter notice to our designated agent. The counter notice must include:
        </p>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <ol className="list-decimal ml-6 space-y-3">
            <li>Your physical or electronic signature.</li>
            <li>Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or access to it was disabled.</li>
            <li>A statement under penalty of perjury that you have a good faith belief that the content was removed or disabled as a result of mistake or misidentification.</li>
            <li>Your name, address, telephone number, and a statement that you consent to the jurisdiction of the federal court in [Your Jurisdiction], and that you will accept service of process from the person who provided the original DMCA notification or an agent of such person.</li>
          </ol>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Policy on Repeat Infringement</h2>
        <p className="mb-6">
          hellsk.com will, in appropriate circumstances, terminate user accounts of those who are repeat infringers of copyrights. We also reserve the right to terminate user accounts even on a single instance of infringement.
        </p>

        <div className="mt-8 p-6 bg-amber-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <p>
            For DMCA notices and counter-notices, please contact us at:
          </p>
          <p className="mt-2 font-medium">
            Email: [DMCA Contact Email]
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
