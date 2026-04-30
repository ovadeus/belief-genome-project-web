import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { FileCheck2 } from "lucide-react";

export default function ConsentForm() {
  return (
    <PublicLayout>
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-display">
          Participant Consent Form
        </h1>
        <p className="text-muted-foreground mb-12">Last updated: April 30, 2026</p>

        <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/5 p-6 md:p-8 mb-12 flex gap-4 items-start">
          <FileCheck2 className="text-[#22c55e] shrink-0 mt-1" size={24} />
          <div>
            <p className="text-[#22c55e] font-display font-semibold text-lg mb-1">In one sentence</p>
            <p className="text-foreground/90 leading-relaxed">
              By using the Belief Genome Project web app, browser extension, or Mission Control desktop app, you voluntarily agree to share your anonymous belief responses with us so we can study, improve, and develop the Services — and you confirm that no personally identifying information is required to participate.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <Section n="1" title="Who is asking">
            <p>
              The Belief Genome Project ("BGP," "we," "our," or "us") is operated by{" "}
              <strong>Ovadeus LLC</strong>, a company based in Savannah, Georgia, USA, founded by David Edwin Meyers. We provide the BGP web app at beliefgenomeproject.org, the BGP browser extension, and the Mission Control desktop application (collectively, the "Services").
            </p>
          </Section>

          <Section n="2" title="What you are consenting to">
            <p>By creating an account, installing the extension, installing the desktop app, or otherwise using any of the Services, you consent to:</p>
            <ul>
              <li>Answering belief prompts that produce numeric responses on a 0–9 scale.</li>
              <li>Having those responses, the resulting Belief DNA string, response timestamps, and basic technical metadata (e.g., app version, error logs) collected and stored by us.</li>
              <li>Optional information you choose to provide on the desktop app, such as approximate demographic metadata, only if you explicitly enter it.</li>
            </ul>
            <p>Your participation creates anonymous belief data. We do not require, request, or attach your real-world identity (name, address, phone number, social-security number, government ID, or biometric data) to the responses themselves.</p>
          </Section>

          <Section n="3" title="Anonymity and de-identification">
            <p>
              Your Belief DNA — the string that summarizes your responses — is anonymous by default and cannot be reverse-engineered into a personal identity. Account credentials (such as your email address) are stored separately from your belief responses and are used only to authenticate you and to send you Service-related communications. Public visualizations, exports, research outputs, and shared links never expose your account email or any personally identifying information.
            </p>
            <p>
              Where the law (such as the EU GDPR, the UK GDPR, or the California CPRA) treats pseudonymous data as personal data, we treat your responses with the same care described in our{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </Section>

          <Section n="4" title="How we use your data">
            <p>You grant Ovadeus LLC a perpetual, worldwide, royalty-free, non-exclusive license to use, store, reproduce, analyze, aggregate, transform, and create derivative works from your anonymous responses for the following purposes:</p>
            <ul>
              <li>Operating, maintaining, and securing the Services.</li>
              <li>Improving the Services — including refining belief prompts, dimension definitions, scoring algorithms, and visualizations.</li>
              <li>Conducting and publishing internal and external research about belief structures, drift, and aggregate population patterns.</li>
              <li>Training, evaluating, and improving the statistical and machine-learning models that power the Services.</li>
              <li>Producing aggregated or anonymized reports, papers, datasets, and visualizations that may be shared or made publicly available.</li>
            </ul>
            <p>This license applies only to anonymous and aggregated data. We do not sell your data and we do not use it for advertising. Any release of data outside of Ovadeus LLC will be in aggregated or anonymized form.</p>
          </Section>

          <Section n="5" title="Your participation is voluntary">
            <p>
              You are free to participate or decline. You may stop participating at any time by signing out, uninstalling the extension or desktop app, or closing your account from the Profile screen. Closing your account will delete your account credentials and unlink your prior responses from your account.
            </p>
            <p>
              Because previously submitted responses are anonymous and may already have been incorporated into aggregated datasets, models, and published research outputs, you understand and agree that we cannot guarantee retroactive removal of those aggregated derivatives. We will, however, honor lawful requests for deletion of identifiable data (such as your email address) under applicable privacy law — see the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details on how to make a request.
            </p>
          </Section>

          <Section n="6" title="What we will never do without separate, explicit consent">
            <ul>
              <li>Attach your real-world identity to a public Belief DNA, share link, or research output.</li>
              <li>Sell, rent, or trade your responses to data brokers or advertisers.</li>
              <li>Use your responses to make automated decisions that produce legal or similarly significant effects on you.</li>
            </ul>
          </Section>

          <Section n="7" title="Risks and benefits">
            <p>
              Participation involves answering reflective questions about beliefs, values, and worldview. Some prompts touch on philosophy, religion, politics, morality, relationships, or other personal topics, and may evoke discomfort, self-reflection, or emotional response. You may skip any prompt at any time.
            </p>
            <p>
              There is no guaranteed personal benefit. You may, however, gain insight into your own belief structure through the dashboard, visualizations, and history features.
            </p>
          </Section>

          <Section n="8" title="Eligibility">
            <p>
              You confirm that you are at least 16 years old, or the age of digital consent in your jurisdiction (whichever is greater), and that you have the legal capacity to enter into this agreement.
            </p>
          </Section>

          <Section n="9" title="Changes to this consent">
            <p>
              We may update this consent form to reflect changes to the Services or the law. If a change materially expands the categories of data we collect or the ways we use it, we will notify you and request your renewed consent before that change applies to you. Otherwise, the "Last updated" date at the top of this page indicates when the form was most recently revised.
            </p>
          </Section>

          <Section n="10" title="How to confirm or withdraw consent">
            <p>
              You confirm your consent by creating an account, installing or signing into the extension or desktop app, or continuing to use the Services after this consent form has been presented to you. You may withdraw your consent at any time by closing your account and uninstalling the apps.
            </p>
            <p>
              Questions about this form, or requests related to your data, should be sent to:
            </p>
            <address className="not-italic">
              <strong>Ovadeus LLC</strong><br />
              Savannah, Georgia, USA<br />
              Email: <a href="mailto:privacy@beliefgenomeproject.org" className="text-primary hover:underline">privacy@beliefgenomeproject.org</a><br />
              Privacy Policy: <Link href="/privacy" className="text-primary hover:underline">beliefgenomeproject.org/privacy</Link><br />
              Terms of Service: <Link href="/terms" className="text-primary hover:underline">beliefgenomeproject.org/terms</Link>
            </address>
          </Section>

          <div className="text-sm text-muted-foreground border-t border-border pt-8">
            <p>
              This consent form is provided for transparency and is not a substitute for legal advice. It does not replace the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> or <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>, which together govern your use of the Services.
            </p>
          </div>
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
