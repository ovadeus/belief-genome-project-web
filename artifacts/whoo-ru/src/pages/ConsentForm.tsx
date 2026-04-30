import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { FileCheck2, X, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCreateConsent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const GENOME_APP_URL = (
  (import.meta.env.VITE_GENOME_APP_URL as string | undefined) || "/genome-app/"
).replace(/\/$/, "");
const REGISTER_URL = `${GENOME_APP_URL}/register`;

export default function ConsentForm() {
  const [agreed, setAgreed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const { toast } = useToast();

  const createConsent = useCreateConsent({
    mutation: {
      onSuccess: (res) => {
        setConfirmation(
          (res?.message || "Thank you. Your consent has been recorded.") +
            " Taking you to the registration page…",
        );
        setEmail("");
        setRedirecting(true);
        // Brief pause so the user sees the confirmation, then send them on.
        window.setTimeout(() => {
          window.location.href = REGISTER_URL;
        }, 1600);
      },
      onError: (err: any) => {
        const msg = err?.message || "Something went wrong. Please try again.";
        setEmailError(msg);
        toast({ title: "Submission failed", description: msg, variant: "destructive" });
      },
    },
  });

  const openModal = () => {
    if (!agreed) return;
    setEmailError(null);
    setConfirmation(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEmail("");
    setEmailError(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
    createConsent.mutate({ data: { email: trimmed, agreed: true, source: "web" } });
  };

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
        </div>

        {/* Agreement form */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">Record your agreement</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            If you have read and accepted the terms above, please confirm your agreement and submit your email so we can record your consent on file.
          </p>

          <label className="flex items-start gap-3 cursor-pointer select-none mb-6">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border accent-primary cursor-pointer"
              data-testid="checkbox-agree-consent"
            />
            <span className="text-foreground leading-relaxed">
              I have read and <strong>Agree to the Consent Form</strong> above. I understand that my belief responses will be collected and used as described, and that no personally identifying information will be attached to those responses.
            </span>
          </label>

          <button
            type="button"
            onClick={openModal}
            disabled={!agreed}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95"
            data-testid="button-agree-and-submit"
          >
            Agree and Submit
          </button>

          <div className="mt-6 text-sm text-muted-foreground border-t border-border pt-6">
            <p>
              This consent form is provided for transparency and is not a substitute for legal advice. It does not replace the <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> or <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>, which together govern your use of the Services.
            </p>
          </div>
        </div>
      </section>

      {/* Email modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
              data-testid="button-close-modal"
            >
              <X size={20} />
            </button>

            {confirmation ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/15 flex items-center justify-center mx-auto mb-4">
                  <Check className="text-[#22c55e]" size={24} />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">Consent Recorded</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{confirmation}</p>
                <a
                  href={REGISTER_URL}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                  data-testid="button-modal-continue"
                >
                  {redirecting && <Loader2 className="animate-spin" size={16} />}
                  Continue to Registration
                </a>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">Confirm your email</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Enter the email address you want associated with your consent record. We use it only to confirm your agreement is on file.
                </p>

                <label className="block text-sm font-medium text-muted-foreground mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  data-testid="input-consent-email"
                />
                {emailError && (
                  <p className="text-destructive text-sm mt-2" data-testid="text-consent-error">{emailError}</p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-5 py-3 rounded-xl bg-background border border-border text-foreground font-semibold hover:bg-foreground/5 transition-all"
                    data-testid="button-modal-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createConsent.isPending}
                    className="flex-1 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    data-testid="button-modal-submit"
                  >
                    {createConsent.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
