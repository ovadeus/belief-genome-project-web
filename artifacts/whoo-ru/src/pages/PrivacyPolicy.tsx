import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-display">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-12">Last updated: April 5, 2026</p>

        <div className="rounded-2xl border border-[#35E4CF]/30 bg-[#35E4CF]/5 p-6 md:p-8 mb-12 flex gap-4 items-start">
          <Shield className="text-[#35E4CF] shrink-0 mt-1" size={24} />
          <div>
            <p className="text-[#35E4CF] font-display font-semibold text-lg mb-1">Core Privacy Principle</p>
            <p className="text-foreground/90 leading-relaxed">
              No user is ever identified by their Belief DNA. Your 128-character Belief Genome string is anonymous by default. Genome serial keys are generated only when you explicitly opt in, and they are never linked to your personal identity in any public-facing data, research output, or shared visualization.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <Section n="1" title="Who We Are">
            <p>
              The Belief Genome Project ("BGP," "we," "our," or "us") is operated by <strong>Ovadeus LLC</strong>, a company based in Savannah, Georgia, USA, founded by David Edwin Meyers. We provide a suite of products including the Belief Genome Project website (beliefgenomeproject.org), the Mission Control desktop application, and the Belief Genome Project Chrome extension (collectively, "the Services").
            </p>
          </Section>

          <Section n="2" title="Our Core Privacy Principle">
            <p>
              <strong>No user is ever identified by their Belief DNA.</strong> Your 128-character Belief Genome string is anonymous by default. Genome serial keys are generated only when you explicitly opt in, and they are never linked to your personal identity in any public-facing data, research output, or shared visualization.
            </p>
          </Section>

          <Section n="3" title="Information We Collect">
            <h4 className="text-foreground font-display font-semibold mt-4 mb-2">3.1 Account Information (Website)</h4>
            <p>When you create an account on beliefgenomeproject.org, we collect:</p>
            <ul>
              <li>Email address</li>
              <li>Password (hashed and salted — we never store plaintext passwords)</li>
              <li>Display name (optional)</li>
            </ul>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">3.2 Belief Data</h4>
            <p>When you respond to belief probes, we collect:</p>
            <ul>
              <li>Your response values (0–9 scale per dimension)</li>
              <li>Timestamps of when responses were submitted</li>
              <li>The resulting 128-character Belief DNA string</li>
            </ul>
            <p>
              You may choose to submit your Belief Genome <strong>anonymously</strong> (no account required) or linked to your account for personal tracking and history. Anonymous submissions cannot be traced back to any individual.
            </p>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">3.3 Demographic Metadata (Desktop App — Optional)</h4>
            <p>The Mission Control desktop app may optionally collect:</p>
            <ul>
              <li>Birth year, month, and day</li>
              <li>Biological sex indicator</li>
              <li>Country code and postal code</li>
              <li>Personal interests and research topics</li>
            </ul>
            <p>
              This metadata is used solely to generate a DNA prefix for your Belief Genome string. It is <strong>stored locally on your device</strong> and is never transmitted to our servers without your explicit action.
            </p>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">3.4 API Keys (Desktop App)</h4>
            <p>Mission Control allows you to enter API keys for third-party AI services (Anthropic Claude, OpenAI, Google Gemini, ElevenLabs, and others). These keys are:</p>
            <ul>
              <li><strong>Stored locally</strong> on your device in your settings file</li>
              <li><strong>Never transmitted</strong> to Belief Genome Project servers</li>
              <li>Used only to make direct API calls from your machine to the respective services</li>
              <li>Exportable with your settings (you choose whether to include or exclude keys)</li>
            </ul>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">3.5 Gmail Integration (Desktop App — Optional)</h4>
            <p>If you connect a Gmail account via Google OAuth, Mission Control accesses your email in <strong>read-only</strong> mode to provide inbox summaries and subscription audit features. We:</p>
            <ul>
              <li>Only read email metadata and subject lines for summary generation</li>
              <li>Do not store full email bodies</li>
              <li>Store OAuth tokens locally on your device only</li>
              <li>Never transmit your email content to BGP servers</li>
            </ul>
            <p>You can disconnect Gmail at any time from Settings, which removes all stored tokens.</p>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">3.6 Chrome Extension</h4>
            <p>The Belief Genome Project Chrome extension:</p>
            <ul>
              <li>Stores probe responses and sync tokens in local extension storage</li>
              <li>Communicates only with your local Mission Control app (localhost) and beliefgenomeproject.org</li>
              <li>Does not access, read, or monitor your browsing history or web activity</li>
              <li>Does not inject scripts into web pages</li>
              <li>Requests only <code>storage</code>, <code>alarms</code>, and <code>notifications</code> permissions</li>
            </ul>
          </Section>

          <Section n="4" title="How We Use Your Information">
            <ul>
              <li>Generate and display your personal Belief Genome visualization</li>
              <li>Contribute to anonymous, aggregate belief research and collective maps</li>
              <li>Provide personalized AI agent services (desktop app only, using your own API keys)</li>
              <li>Sync belief data between the website, desktop app, and Chrome extension</li>
              <li>Send optional nudge reminders to answer probes (Chrome extension, configurable)</li>
            </ul>
          </Section>

          <Section n="5" title="Data Storage & Security">
            <h4 className="text-foreground font-display font-semibold mt-4 mb-2">5.1 Website Data</h4>
            <p>Account information and belief responses submitted through the website are stored in a secured PostgreSQL database with encrypted connections. Passwords are hashed using industry-standard algorithms.</p>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">5.2 Desktop App Data</h4>
            <p>All Mission Control data — settings, API keys, widgets, agent logs, media files, and belief responses — is stored <strong>locally on your device</strong> in your user documents folder. No desktop app data is sent to our servers unless you explicitly submit your genome to the website.</p>

            <h4 className="text-foreground font-display font-semibold mt-6 mb-2">5.3 File System Access</h4>
            <p>Certain AI agents (File Organizer, Desktop Cleanup) access specific folders on your machine (Downloads, Documents, Desktop). These agents only operate when you manually run them and require your explicit action each time.</p>
          </Section>

          <Section n="6" title="Data Sharing & Third Parties">
            <p>We do not sell, rent, or trade your personal information. Data may be shared in these limited cases:</p>
            <ul>
              <li><strong>Anonymous aggregate research:</strong> De-identified belief data may be used in published research about collective belief patterns. Individual users are never identifiable.</li>
              <li><strong>Third-party AI APIs:</strong> When you use AI agents in the desktop app, prompts are sent directly from your device to the AI provider using <em>your</em> API keys. BGP does not act as an intermediary.</li>
              <li><strong>Unsplash:</strong> The desktop app fetches background photos from Unsplash. No personal data is shared with Unsplash.</li>
            </ul>
          </Section>

          <Section n="7" title="Your Rights & Controls">
            <ul>
              <li><strong>Delete your account:</strong> Contact us to permanently delete your website account and all associated data</li>
              <li><strong>Export your data:</strong> Use the desktop app's Settings &gt; Export feature to download all your data</li>
              <li><strong>Disconnect integrations:</strong> Remove Gmail or other connections at any time from Settings</li>
              <li><strong>Opt out of genome submission:</strong> Use the desktop app without ever syncing to the website</li>
              <li><strong>Clear belief history:</strong> Reset your genome and start fresh at any time</li>
              <li><strong>Revoke extension:</strong> Uninstall the Chrome extension to remove all extension data</li>
            </ul>
          </Section>

          <Section n="8" title="Children's Privacy">
            <p>The Services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.</p>
          </Section>

          <Section n="9" title="Cookies & Tracking">
            <p>The Belief Genome Project website uses only essential session cookies required for authentication. We do not use advertising trackers, analytics cookies, or third-party tracking pixels. The desktop app and Chrome extension do not use cookies.</p>
          </Section>

          <Section n="10" title="Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the Services after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section n="11" title="Contact Us">
            <p>If you have questions about this Privacy Policy or your data, contact us at:</p>
            <address className="not-italic mt-4 text-foreground/90">
              <strong>Ovadeus LLC</strong><br />
              Savannah, Georgia, USA<br />
              Email: <a href="mailto:privacy@beliefgenomeproject.org" className="text-primary hover:underline">privacy@beliefgenomeproject.org</a><br />
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
      <div className="text-muted-foreground leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-foreground/80">
        {children}
      </div>
    </div>
  );
}
