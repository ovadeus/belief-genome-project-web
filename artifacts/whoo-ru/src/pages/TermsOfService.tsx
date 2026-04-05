import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <PublicLayout>
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-display">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-12">Last updated: April 5, 2026</p>

        <div className="space-y-10">
          <Section n="1" title="Agreement to Terms">
            <p>
              By accessing or using the Belief Genome Project website (beliefgenomeproject.org), the Mission Control desktop application, or the Belief Genome Project Chrome extension (collectively, "the Services"), you agree to be bound by these Terms of Service ("Terms"). The Services are provided by <strong>Ovadeus LLC</strong> ("we," "our," or "us"), based in Savannah, Georgia, USA.
            </p>
            <p>If you do not agree to these Terms, do not use the Services.</p>
          </Section>

          <Section n="2" title="Description of Services">
            <p>The Belief Genome Project provides:</p>
            <ul>
              <li><strong>Website (beliefgenomeproject.org):</strong> A platform to answer belief probes, visualize your 128-dimension Belief Genome, and contribute to collective belief mapping research.</li>
              <li><strong>Mission Control Desktop App:</strong> An AI-powered personal intelligence dashboard featuring belief probes, productivity widgets, AI agents, and a media library.</li>
              <li><strong>Chrome Extension:</strong> A browser companion for answering belief probes and syncing responses with the desktop app and website.</li>
            </ul>
          </Section>

          <Section n="3" title="Accounts & Registration">
            <ul>
              <li>You must provide a valid email address to create a website account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 13 years old to use the Services.</li>
              <li>One person or entity may not maintain more than one account.</li>
              <li>You agree to provide accurate information and to update it as needed.</li>
            </ul>
          </Section>

          <Section n="4" title="User Data & Belief Genome">
            <h4 className="text-foreground font-display font-semibold mt-4 mb-2">4.1 Your Belief Data</h4>
            <p>
              Your responses to belief probes generate a 128-character Belief DNA string. You retain ownership of your belief data at all times. By submitting your genome to the website, you grant us a non-exclusive, royalty-free license to use your <strong>anonymized, de-identified</strong> belief data in aggregate research and collective visualizations.
            </p>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">4.2 Anonymity by Default</h4>
            <p>Your Belief DNA is anonymous by default. Genome serial keys are opt-in only. We never publicly associate belief data with personally identifiable information.</p>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">4.3 Local Data</h4>
            <p>Data stored locally by the Mission Control desktop app (settings, API keys, agent outputs, media files) remains on your device. We have no access to your local data unless you explicitly sync or submit it.</p>
          </Section>

          <Section n="5" title="API Keys & Third-Party Services">
            <ul>
              <li>The desktop app allows you to enter your own API keys for third-party AI services (Anthropic, OpenAI, Google, ElevenLabs, etc.).</li>
              <li>You are solely responsible for your API key usage, associated costs, and compliance with each provider's terms of service.</li>
              <li>BGP does not act as an intermediary — API calls are made directly from your device to the provider.</li>
              <li>We are not responsible for charges incurred through your API key usage.</li>
            </ul>
          </Section>

          <Section n="6" title="AI Agents & Automated Actions">
            <ul>
              <li>AI agents in Mission Control perform tasks using your API keys and local files.</li>
              <li>Agents that access your file system (File Organizer, Desktop Cleanup) only operate when you manually initiate them.</li>
              <li>You are responsible for reviewing agent outputs. AI-generated content may contain errors.</li>
              <li>We are not liable for any actions taken by AI agents on your behalf, including file modifications, email summaries, or generated content.</li>
            </ul>
          </Section>

          <Section n="7" title="Gmail Integration">
            <ul>
              <li>Gmail integration uses Google OAuth with read-only access.</li>
              <li>We never modify, delete, or send emails on your behalf.</li>
              <li>Email summaries are generated locally on your device and are not stored on our servers.</li>
              <li>You can revoke Gmail access at any time from Settings or from your Google Account security settings.</li>
            </ul>
          </Section>

          <Section n="8" title="Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Services for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble the software</li>
              <li>Distribute malware or harmful code through the platform</li>
              <li>Impersonate others or submit false information</li>
              <li>Use automated systems to scrape data from the website</li>
              <li>Attempt to access other users' accounts or data</li>
              <li>Use the Services to harass, abuse, or harm others</li>
            </ul>
          </Section>

          <Section n="9" title="Intellectual Property">
            <ul>
              <li>The Belief Genome Project name, logo, and brand assets are trademarks of Ovadeus LLC.</li>
              <li>The 128-dimension belief mapping framework, DNA string format, and associated algorithms are proprietary to Ovadeus LLC.</li>
              <li>The website, desktop app, and Chrome extension source code are proprietary.</li>
              <li>You retain ownership of your personal belief data and any content you create using the Services.</li>
            </ul>
          </Section>

          <Section n="10" title="Disclaimer of Warranties">
            <p>
              The Services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, whether express or implied. We do not warrant that:
            </p>
            <ul>
              <li>The Services will be uninterrupted or error-free</li>
              <li>AI agent outputs will be accurate, complete, or reliable</li>
              <li>Belief probes represent comprehensive or scientific measurement</li>
              <li>The Services will meet your specific requirements</li>
            </ul>
            <p>The Belief Genome is a personal reflection tool, not a scientific diagnostic instrument.</p>
          </Section>

          <Section n="11" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Ovadeus LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, profits, or goodwill, arising from your use of the Services. This includes damages resulting from:
            </p>
            <ul>
              <li>AI agent actions or file modifications</li>
              <li>Third-party API charges incurred through your keys</li>
              <li>Loss of data stored locally on your device</li>
              <li>Interruption or discontinuation of the Services</li>
            </ul>
          </Section>

          <Section n="12" title="Termination">
            <ul>
              <li>You may stop using the Services and delete your account at any time.</li>
              <li>We may suspend or terminate your access if you violate these Terms.</li>
              <li>Upon termination, your website data will be deleted. Local desktop app data remains on your device.</li>
            </ul>
          </Section>

          <Section n="13" title="Changes to Terms">
            <p>We may update these Terms from time to time. Changes will be posted on this page with an updated date. Continued use of the Services after changes constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section n="14" title="Governing Law">
            <p>These Terms are governed by the laws of the State of Georgia, United States, without regard to conflict of law principles.</p>
          </Section>

          <Section n="15" title="Contact Us">
            <p>If you have questions about these Terms, contact us at:</p>
            <address className="not-italic mt-4 text-foreground/90">
              <strong>Ovadeus LLC</strong><br />
              Savannah, Georgia, USA<br />
              Email: <a href="mailto:legal@beliefgenomeproject.org" className="text-primary hover:underline">legal@beliefgenomeproject.org</a><br />
              Web: <Link href="/support" className="text-primary hover:underline">beliefgenomeproject.org/support</Link>
            </address>
          </Section>
        </div>
      </section>
    </PublicLayout>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xl font-display font-semibold text-foreground mb-3">
        {n}. {title}
      </h3>
      <div className="text-muted-foreground leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}
