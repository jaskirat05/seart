import LegalLayout from '../components/LegalLayout';

export default function LegalNotice() {
  return (
    <LegalLayout title="Legal Notice" lastUpdated="25 November 2024">
      <h2 className="text-2xl font-bold mb-4">Company Information</h2>
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <p className="mb-2">Evo Growth LLC</p>
        <p className="mb-2">Email: [Contact Email]</p>
        <p>Website: hellsk.com</p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Intellectual Property Rights</h2>
      <p className="mb-6">
        All content included on this website, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Evo Growth LLC or its content suppliers and protected by international copyright laws.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer</h2>
      <div className="space-y-4">
        <p>
          The materials on Hell&apos;s Kitchen&apos;s website are provided on an &apos;as is&apos; basis. Hell&apos;s Kitchen makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <p>
          Further, Hell&apos;s Kitchen does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Limitations</h2>
      <p className="mb-6">
        In no event shall Hell&apos;s Kitchen or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Hell&apos;s Kitchen&apos;s website, even if Hell&apos;s Kitchen or a Hell&apos;s Kitchen authorized representative has been notified orally or in writing of the possibility of such damage.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Accuracy of Materials</h2>
      <p className="mb-6">
        The materials appearing on Hell&apos;s Kitchen&apos;s website could include technical, typographical, or photographic errors. Hell&apos;s Kitchen does not warrant that any of the materials on its website are accurate, complete, or current. Hell&apos;s Kitchen may make changes to the materials contained on its website at any time without notice.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Links</h2>
      <p className="mb-6">
        Hell&apos;s Kitchen has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Hell&apos;s Kitchen of the site. Use of any such linked website is at the user&apos;s own risk.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Modifications</h2>
      <p className="mb-6">
        Hell&apos;s Kitchen may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Governing Law</h2>
      <p>
        These terms and conditions are governed by and construed in accordance with the laws of New South Wales, Australia, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
      </p>
    </LegalLayout>
  );
}
