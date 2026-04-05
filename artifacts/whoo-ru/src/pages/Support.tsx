import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Mail, Monitor, Globe, Chrome, Cpu, MessageSquare, HelpCircle, Settings, BookOpen, Gamepad2 } from "lucide-react";

const tocSections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "mission-control", label: "Mission Control" },
  { id: "agents", label: "Built-In Agents" },
  { id: "widgets", label: "Dashboard Widgets" },
  { id: "probes", label: "Probe Widget" },
  { id: "settings", label: "Settings" },
  { id: "extension", label: "Chrome Extension" },
  { id: "gmail-setup", label: "Gmail Setup" },
  { id: "website", label: "Website" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export default function Support() {
  const [activeSection, setActiveSection] = useState("getting-started");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );
    tocSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <PublicLayout>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-display">
          Help & Support
        </h1>
        <p className="text-muted-foreground mb-12">Everything you need to know about the Belief Genome Project ecosystem.</p>

        <div className="flex gap-12">
          <nav className="hidden lg:block w-56 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
            <ul className="space-y-1 border-l border-border pl-4">
              {tocSections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`block py-1.5 text-sm transition-colors ${
                      activeSection === s.id
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 min-w-0 space-y-16">
            <div id="getting-started">
              <SectionHeading icon={<HelpCircle size={22} />} title="Getting Started" />
              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">What is the Belief Genome Project?</h4>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The Belief Genome Project maps your worldview into a 128-character DNA string across 11 belief domains — from epistemology and spirituality to politics and relationships. Answer probes, watch your genome evolve, and see how your beliefs compare to the collective.
              </p>

              <h4 className="text-foreground font-display font-semibold mb-3">The BGP Ecosystem</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">The project has three connected products:</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <EcoCard icon={<Globe size={20} />} title="Website" desc="Create an account, answer probes, visualize your genome, and explore collective belief data." />
                <EcoCard icon={<Monitor size={20} />} title="Mission Control" desc="Your AI-powered personal dashboard with belief probes, productivity widgets, AI agents, and a media library. Available for macOS (Windows coming soon)." />
                <EcoCard icon={<Chrome size={20} />} title="Chrome Extension" desc="Answer probes from your browser toolbar and sync with your desktop app and website account." />
              </div>
            </div>

            <div id="mission-control">
              <SectionHeading icon={<Monitor size={22} />} title="Mission Control Desktop App" />
              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">Four Main Sections</h4>
              <div className="space-y-4">
                <FeatureBlock title="Mission Control (Dashboard)" desc="Your home command center. Features a customizable grid of productivity widgets, a daily background photo, and the persistent probe bar at the bottom for answering belief questions from any section." />
                <FeatureBlock title="AI Agents" desc="Your AI-powered agent library. Run built-in agents for email summaries, file organization, desktop cleanup, research, transcription, and more. Create your own custom agents with the Agent Builder. All agents use YOUR API keys — calls go directly from your machine to the AI provider." />
                <FeatureBlock title="Media Library" desc="A repository for all your transcripts, generated audio, and media files produced by agents. Supports YouTube transcription, audio transcription (Whisper), PDF extraction, and text-to-speech generation." />
                <FeatureBlock title="Belief Genome" desc="Your personal belief map. View your 128-dimension genome as a radar chart, category breakdown, response history timeline, and the iconic DNA string. Submit your genome to the website to contribute to collective research (anonymous or account-linked)." />
              </div>
            </div>

            <div id="agents">
              <SectionHeading icon={<Cpu size={22} />} title="Built-In Agents" />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-foreground font-display font-semibold">Agent</th>
                      <th className="text-left py-3 px-4 text-foreground font-display font-semibold">What It Does</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <AgentRow name="Gmail Summary" desc="Summarizes unread emails across connected Gmail accounts" />
                    <AgentRow name="Daily Planner" desc="Creates a daily plan from your inbox, calendar, and habits" />
                    <AgentRow name="File Organizer" desc="Sorts Downloads and Documents into category folders" />
                    <AgentRow name="Gmail Spam Audit" desc="Audits inbox patterns and suggests unsubscribes" />
                    <AgentRow name="Desktop Cleanup" desc="Organizes Desktop files into sorted subfolders" />
                    <AgentRow name="Research Pulse" desc="Researches your interest topics from news and RSS feeds" />
                    <AgentRow name="Probe Generator" desc="Generates belief probes based on current events and your interests" />
                    <AgentRow name="YouTube Transcribe" desc="Transcribes YouTube videos and saves to your media library" />
                    <AgentRow name="Audio Transcribe" desc="Transcribes audio files using OpenAI Whisper" />
                    <AgentRow name="PDF Transcribe" desc="Extracts and summarizes text from PDF files" />
                    <AgentRow name="Text to Speech" desc="Generates spoken audio from text using ElevenLabs" />
                  </tbody>
                </table>
              </div>
            </div>

            <div id="widgets">
              <SectionHeading icon={<Gamepad2 size={22} />} title="Dashboard Widgets" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-4">Widgets are draggable, reorderable, and toggleable. Available widgets:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Tasks", "To-do list with completion tracking"],
                  ["Bookmarks", "Quick link collection"],
                  ["App Launch Pad", "Desktop application shortcuts"],
                  ["Notes", "Quick note-taking"],
                  ["Deep Work", "Pomodoro-style focus timer (25/50/90 min presets)"],
                  ["Habits", "Daily habit tracker with calendar view"],
                  ["Countdowns", "Event countdown timers"],
                  ["Dates", "Special dates and anniversaries"],
                  ["MusicPax", "Music streaming integration"],
                  ["Inbox", "Gmail summary card"],
                  ["Research", "Latest Research Pulse results"],
                  ["Activity", "Agent run log"],
                ].map(([name, desc]) => (
                  <div key={name} className="flex gap-3 items-start p-3 rounded-lg bg-card/50 border border-border">
                    <span className="text-primary font-display font-semibold text-sm shrink-0">{name}</span>
                    <span className="text-muted-foreground text-sm">— {desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To reorder widgets, click the grid icon in the top-right of the dashboard to enter organize mode. Drag widgets to rearrange, then click the icon again to save.
              </p>
            </div>

            <div id="probes">
              <SectionHeading icon={<MessageSquare size={22} />} title="Probe Widget" />
              <p className="text-muted-foreground leading-relaxed mt-4">
                The probe bar sits at the bottom of every section. Each probe presents a belief statement with a slider ranging from False (green) to Uncertain (white) to True (blue). Click Submit to record your response, or Skip to move to the next probe. Your response history and dimension count appear as mini stats.
              </p>
            </div>

            <div id="settings">
              <SectionHeading icon={<Settings size={22} />} title="Settings & Configuration" />
              <div className="space-y-4 mt-4">
                <FeatureBlock title="Profile & Identity" desc="Name, birth metadata, interests, country, postal code. Birth data generates your DNA prefix." />
                <FeatureBlock title="API Keys" desc="Required: Anthropic Claude key. Optional: OpenAI, Google Gemini, ElevenLabs, Runway, Stability AI, Suno, Replicate, HeyGen, fal.ai. Keys are stored locally, never sent to our servers." />
                <FeatureBlock title="Gmail Integration" desc="Connect via Google OAuth (read-only). Requires a Google Cloud project with OAuth credentials. See setup guide below." />
                <FeatureBlock title="Research Sources" desc="Configure web, Reddit, and RSS feed sources for the Research Pulse agent." />
                <FeatureBlock title="Background" desc="Choose Unsplash photos, custom images, video backgrounds, or solid colors. Set theme and refresh interval." />
                <FeatureBlock title="Widget Visibility" desc="Toggle individual widgets on or off." />
              </div>
            </div>

            <div id="extension">
              <SectionHeading icon={<Chrome size={22} />} title="Chrome Extension" />
              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">Setup</h4>
              <ol className="list-decimal pl-6 text-muted-foreground leading-relaxed space-y-2">
                <li>Install from the Chrome Web Store (or load unpacked for development)</li>
                <li>Click the BGP icon in your browser toolbar</li>
                <li>Go to Settings (gear icon) and enter your pairing token from the desktop app (Settings &gt; Integrations &gt; Chrome Extension)</li>
                <li>Enter your beliefgenomeproject.org email and password to sync with the website</li>
              </ol>

              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">Features</h4>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-2">
                <li>Answer belief probes with the same green-white-blue slider</li>
                <li>See sync status indicators for Desktop (green dot) and Website (blue dot)</li>
                <li>View your response count and pending sync count</li>
                <li>Receive optional nudge reminders at configurable intervals</li>
                <li>Responses sync automatically when connected</li>
              </ul>

              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">Nudge Reminders</h4>
              <p className="text-muted-foreground leading-relaxed">
                Set a reminder interval in extension Settings to receive periodic prompts to answer probes. Options range from every 30 minutes to daily. Set to "Off" to disable.
              </p>
            </div>

            <div id="gmail-setup">
              <SectionHeading icon={<Mail size={22} />} title="Gmail Integration Setup" />
              <p className="text-muted-foreground leading-relaxed mt-4 mb-4">
                Gmail integration requires a Google Cloud project. This is a one-time setup:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground leading-relaxed space-y-3">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                <li>Create a new project (name it anything, e.g. "BGP Desktop")</li>
                <li>Enable the <strong>Gmail API</strong> (APIs & Services &gt; Library &gt; search "Gmail API" &gt; Enable)</li>
                <li>
                  Configure <strong>OAuth consent screen</strong> (APIs & Services &gt; OAuth consent screen):
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Choose External</li>
                    <li>Set app name and your email</li>
                    <li>Add your Gmail address as a Test User</li>
                  </ul>
                </li>
                <li>
                  Create <strong>OAuth credentials</strong> (APIs & Services &gt; Credentials &gt; + Create Credentials &gt; OAuth client ID):
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Application type: <strong>Desktop app</strong></li>
                    <li>Copy the Client ID and Client Secret</li>
                  </ul>
                </li>
                <li>In Mission Control Settings, paste both values under Gmail Integration</li>
                <li>Click Save, then click <strong>+ Connect Gmail Account</strong></li>
                <li>Sign in with Google when the browser opens</li>
              </ol>
              <p className="text-muted-foreground leading-relaxed mt-4">
                After connecting, the app refreshes tokens automatically. You should never need to reconnect unless you revoke access in your Google Account settings.
              </p>
            </div>

            <div id="website">
              <SectionHeading icon={<Globe size={22} />} title="Belief Genome Website" />
              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">Creating an Account</h4>
              <ol className="list-decimal pl-6 text-muted-foreground leading-relaxed space-y-2">
                <li>Visit beliefgenomeproject.org</li>
                <li>Click "Get Started"</li>
                <li>Enter your email and create a password</li>
                <li>Start answering probes to build your genome</li>
              </ol>

              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">Dashboard Views</h4>
              <ul className="list-disc pl-6 text-muted-foreground leading-relaxed space-y-2">
                <li><strong>Radar Chart</strong> — Visual overview of all 11 belief domains</li>
                <li><strong>Breakdown</strong> — Bar chart of individual dimension scores within each category</li>
                <li><strong>History</strong> — Timeline of your probe responses</li>
                <li><strong>DNA String</strong> — Your full 128-character genome with color-coded values</li>
              </ul>

              <h4 className="text-foreground font-display font-semibold mt-6 mb-3">Syncing with Desktop & Extension</h4>
              <p className="text-muted-foreground leading-relaxed">
                Your website account syncs belief data with the Mission Control desktop app and Chrome extension. Log in with the same email across all three products. Responses submitted from any platform update your unified genome.
              </p>
            </div>

            <div id="faq">
              <SectionHeading icon={<BookOpen size={22} />} title="FAQ" />
              <div className="space-y-6 mt-4">
                <FaqItem q="Is my data private?" a={<>Yes. API keys and settings are stored locally on your device. Belief data is anonymous by default. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details.</>} />
                <FaqItem q="Do I need API keys to use the app?" a="You need at least one AI provider key (Anthropic Claude recommended) for AI agents to work. The belief probe system, widgets, and media library work without API keys." />
                <FaqItem q="Can I use the website without the desktop app?" a="Yes. The website is fully standalone for answering probes and viewing your genome. The desktop app and extension are optional companions." />
                <FaqItem q="Can I use the desktop app without the website?" a="Yes. The desktop app works fully offline. You only need a website account if you want to sync your genome or contribute to collective research." />
                <FaqItem q="How do I reset my genome?" a="In the desktop app, go to Settings and use the data export/import tools. On the website, contact support to reset your account data." />
                <FaqItem q="Is there a Windows version?" a="Coming soon. Mission Control is currently available for macOS." />
                <FaqItem q="How do I create custom agents?" a='In the AI Agents section, click "Create Agent" to open the Agent Builder. Define a name, description, behavior instructions, required APIs, and input fields. Your custom agent will appear alongside the built-in agents.' />
              </div>
            </div>

            <div id="contact">
              <SectionHeading icon={<Mail size={22} />} title="Contact & Support" />
              <div className="mt-4 p-6 rounded-2xl bg-card border border-border">
                <address className="not-italic text-muted-foreground leading-relaxed space-y-2">
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@beliefgenomeproject.org" className="text-primary hover:underline">support@beliefgenomeproject.org</a></p>
                  <p><strong className="text-foreground">Website:</strong> beliefgenomeproject.org</p>
                  <p><strong className="text-foreground">Operated by:</strong> Ovadeus LLC, Savannah, Georgia, USA</p>
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border">
      <span className="text-primary">{icon}</span>
      <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
    </div>
  );
}

function EcoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-2">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-display font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureBlock({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border">
      <h5 className="font-display font-semibold text-foreground mb-1">{title}</h5>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function AgentRow({ name, desc }: { name: string; desc: string }) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">{name}</td>
      <td className="py-3 px-4">{desc}</td>
    </tr>
  );
}

function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-foreground font-display font-semibold mb-1">{q}</h4>
      <p className="text-muted-foreground leading-relaxed">{a}</p>
    </div>
  );
}
