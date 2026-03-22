// Belief Genome Dashboard — 6 tabs matching desktop exactly
// Triple Helix | Radar | Breakdown | Timeline | History | Forecaster
// + Personalized greeting + daily rotating quote + Stats row
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGenomeAuth, genomeApi } from '../../components/genome/GenomeAuthContext';
import TripleHelix from '../../components/genome/TripleHelix';
import RadarChart from '../../components/genome/RadarChart';
import BreakdownBars from '../../components/genome/BreakdownBars';
import Timeline from '../../components/genome/Timeline';
import HistoryList from '../../components/genome/HistoryList';
import Forecaster from '../../components/genome/Forecaster';
import DnaString from '../../components/genome/DnaString';

/* ── 100 curated quotes on self-knowledge ─────────────────── */
const QUOTES = [
  { text: "The only journey is the one within.", author: "Rainer Maria Rilke" },
  { text: "Who looks outside, dreams; who looks inside, awakes.", author: "Carl Jung" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "Man is not what he thinks he is, he is what he hides.", author: "André Malraux" },
  { text: "One's own self is well hidden from one's own self.", author: "Friedrich Nietzsche" },
  { text: "The greatest thing in the world is to know how to belong to oneself.", author: "Michel de Montaigne" },
  { text: "He who knows others is wise; he who knows himself is enlightened.", author: "Lao Tzu" },
  { text: "The self is not something ready-made, but something in continuous formation through choice of action.", author: "John Dewey" },
  { text: "Everything that irritates us about others can lead us to an understanding of ourselves.", author: "Carl Jung" },
  { text: "Your vision will become clear only when you look into your heart.", author: "Carl Jung" },
  { text: "I am not what happened to me. I am what I choose to become.", author: "Carl Jung" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Trust thyself: every heart vibrates to that iron string.", author: "Ralph Waldo Emerson" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
  { text: "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.", author: "Rumi" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "At the center of your being you have the answer; you know who you are and you know what you want.", author: "Lao Tzu" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "To know what you know and what you do not know — that is true knowledge.", author: "Confucius" },
  { text: "We know what we are, but not what we may be.", author: "William Shakespeare" },
  { text: "The most courageous act is still to think for yourself. Aloud.", author: "Coco Chanel" },
  { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
  { text: "There is only one corner of the universe you can be certain of improving, and that's your own self.", author: "Aldous Huxley" },
  { text: "You cannot find peace by avoiding life.", author: "Virginia Woolf" },
  { text: "It is not the mountain we conquer, but ourselves.", author: "Edmund Hillary" },
  { text: "The quieter you become, the more you can hear.", author: "Ram Dass" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl" },
  { text: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.", author: "Viktor Frankl" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Become who you are.", author: "Friedrich Nietzsche" },
  { text: "The most common form of despair is not being who you are.", author: "Søren Kierkegaard" },
  { text: "Life can only be understood backwards, but it must be lived forwards.", author: "Søren Kierkegaard" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", author: "Albert Einstein" },
  { text: "We shall not cease from exploration, and the end of all our exploring will be to arrive where we started and know the place for the first time.", author: "T.S. Eliot" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "Do I dare disturb the universe?", author: "T.S. Eliot" },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung" },
  { text: "Tell me, what is it you plan to do with your one wild and precious life?", author: "Mary Oliver" },
  { text: "You do not have to be good. You do not have to walk on your knees for a hundred miles through the desert, repenting.", author: "Mary Oliver" },
  { text: "Real generosity toward the future lies in giving all to the present.", author: "Albert Camus" },
  { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
  { text: "The most important kind of freedom is to be what you really are.", author: "Jim Morrison" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Daring greatly means the courage to be vulnerable.", author: "Brené Brown" },
  { text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome.", author: "Brené Brown" },
  { text: "The present moment is the only moment available to us, and it is the door to all moments.", author: "Thich Nhat Hanh" },
  { text: "Smile, breathe, and go slowly.", author: "Thich Nhat Hanh" },
  { text: "Muddy water is best cleared by leaving it alone.", author: "Alan Watts" },
  { text: "The meaning of life is just to be alive. It is so plain and so obvious and so simple. And yet everybody rushes around in a great panic as if it were necessary to achieve something beyond themselves.", author: "Alan Watts" },
  { text: "You are not a drop in the ocean. You are the entire ocean in a drop.", author: "Rumi" },
  { text: "Do not go where the path may lead; go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "Finish each day and be done with it. You have done what you could.", author: "Ralph Waldo Emerson" },
  { text: "The things you own end up owning you.", author: "Chuck Palahniuk" },
  { text: "It's only after we've lost everything that we're free to do anything.", author: "Chuck Palahniuk" },
  { text: "We accept the love we think we deserve.", author: "Stephen Chbosky" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "A man who knows how little he knows is well, a man who knows how much he knows is sick.", author: "Lao Tzu" },
  { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama XIV" },
  { text: "If you want others to be happy, practice compassion. If you want to be happy, practice compassion.", author: "Dalai Lama XIV" },
  { text: "The curious paradox is that when I accept myself just as I am, then I can change.", author: "Carl Rogers" },
  { text: "What is necessary to change a person is to change his awareness of himself.", author: "Abraham Maslow" },
  { text: "A ship in harbor is safe, but that is not what ships are for.", author: "John A. Shedd" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.", author: "Mark Twain" },
  { text: "It is never too late to be what you might have been.", author: "George Eliot" },
  { text: "Our lives begin to end the day we become silent about things that matter.", author: "Martin Luther King Jr." },
  { text: "The time is always right to do what is right.", author: "Martin Luther King Jr." },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
  { text: "We must be willing to let go of the life we planned so as to have the life that is waiting for us.", author: "Joseph Campbell" },
  { text: "The big question is whether you are going to be able to say a hearty yes to your adventure.", author: "Joseph Campbell" },
  { text: "What you are is what you have been. What you'll be is what you do now.", author: "Buddha" },
  { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "The most difficult thing is the decision to act; the rest is merely tenacity.", author: "Amelia Earhart" },
  { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus" },
  { text: "You will never be brave if you don't get hurt, and you will never learn if you don't make mistakes.", author: "Paulo Coelho" },
  { text: "When you want something, all the universe conspires in helping you to achieve it.", author: "Paulo Coelho" },
  { text: "It's the possibility of having a dream come true that makes life interesting.", author: "Paulo Coelho" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "To love oneself is the beginning of a lifelong romance.", author: "Oscar Wilde" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
  { text: "Whatever you can do or dream you can, begin it. Boldness has genius, power and magic in it.", author: "Johann Wolfgang von Goethe" },
  { text: "One does not become enlightened by imagining figures of light, but by making the darkness conscious.", author: "Carl Jung" },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
  { text: "The greatest hazard of all, losing one's self, can occur very quietly in the world, as if it were nothing at all.", author: "Søren Kierkegaard" },
  { text: "To dare is to lose one's footing momentarily. To not dare is to lose oneself.", author: "Søren Kierkegaard" },
  { text: "Man cannot stand a meaningless life.", author: "Carl Jung" },
  { text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", author: "Rumi" },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
];

/* ── Greeting + daily quote — matches desktop exactly ─────── */
function getGreeting(name?: string): string {
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${tod}, ${name}.` : `${tod}.`;
}

function getDailyQuote(): typeof QUOTES[0] {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return QUOTES[dayIndex % QUOTES.length];
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

type Tab = 'helix' | 'radar' | 'breakdown' | 'timeline' | 'history' | 'forecaster';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'helix',      icon: '\u2728', label: 'Triple Helix' },
  { key: 'radar',      icon: '\u25CE', label: 'Radar' },
  { key: 'breakdown',  icon: '\u2502', label: 'Breakdown' },
  { key: 'timeline',   icon: '\u223F', label: 'Timeline' },
  { key: 'history',    icon: '\u2630', label: 'History' },
  { key: 'forecaster', icon: '\u2699', label: 'Forecaster' },
];

/* ── Helper: day streak ─────────────────────────────────────── */
function calcStreak(history: any[]): number {
  if (!history.length) return 0;
  const days = new Set(history.map(h => new Date(h.createdAt).toDateString()));
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function DashboardPage() {
  const { user } = useGenomeAuth();
  const [tab, setTab] = useState<Tab>('helix');
  const [dna, setDna] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [showDnaModal, setShowDnaModal] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState('');

  const greeting = useMemo(() => getGreeting(user?.name), [user?.name]);
  const dailyQuote = useMemo(() => getDailyQuote(), []);
  const formattedDate = useMemo(() => getFormattedDate(), []);

  useEffect(() => {
    genomeApi('/dna').then(r => r.json()).then(setDna).catch(() => {});
    genomeApi('/history?limit=200').then(r => r.json()).then(setHistory).catch(() => {});
    genomeApi('/dimensions').then(r => r.json()).then(d => {
      setDimensions(d.dimensions || []);
    }).catch(() => {});
  }, []);

  const runAnalysis = useCallback(async () => {
    setAnalysing(true);
    try {
      const res = await genomeApi('/analyse', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis || 'Analysis complete.');
      }
    } catch {}
    setAnalysing(false);
  }, []);

  // Stats
  const totalResponses = history.length;
  const cats = [...new Set(history.map((h: any) => h.probeCategory).filter(Boolean))].length;
  const streak = calcStreak(history);
  const newsProbes = history.filter((h: any) => (h.probeSource || '').startsWith('news:')).length;
  const avgAgreement = totalResponses > 0
    ? Math.round((history.reduce((s: number, h: any) => s + h.value, 0) / totalResponses) * 100)
    : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Greeting + Daily Quote — matches desktop */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>
          {greeting}
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0, marginTop: 6, flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.35)',
          }}>
            {formattedDate}
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.15)', margin: '0 12px', fontSize: 14, userSelect: 'none',
          }}>|</span>
          <span style={{
            fontSize: 13, color: 'rgba(108,143,255,0.7)', fontStyle: 'italic',
          }}>
            &ldquo;{dailyQuote.text}&rdquo;
          </span>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 10,
            fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {dailyQuote.author}
          </span>
        </div>
      </div>

      {/* Analysis result */}
      {analysis && (
        <div style={{
          padding: 16, borderRadius: 8, marginBottom: 16,
          background: 'rgba(108,143,255,0.06)', border: '1px solid rgba(108,143,255,0.15)',
          fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
        }}>
          {analysis}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {[
          { num: totalResponses, label: 'Responses' },
          { num: cats, label: 'Categories' },
          { num: streak, label: 'Day Streak' },
          { num: newsProbes, label: 'News Probes' },
          { num: `${avgAgreement}%`, label: 'Avg Agreement' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, minWidth: 90, padding: '12px 16px', textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700, color: '#6c8fff',
              fontFamily: "'Space Mono', monospace",
            }}>
              {s.num}
            </div>
            <div style={{
              fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2,
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px', borderRadius: 10, minHeight: 44,
              background: tab === t.key ? 'rgba(108,143,255,0.2)' : 'transparent',
              color: tab === t.key ? '#6c8fff' : 'rgba(255,255,255,0.4)',
              fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
              fontWeight: tab === t.key ? 600 : 400,
              border: tab === t.key ? '1px solid rgba(108,143,255,0.3)' : '1px solid transparent',
            }}
          >
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{
        padding: 24, borderRadius: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        minHeight: 300,
      }}>
        {!dna && tab !== 'forecaster' ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 60 }}>
            Loading...
          </div>
        ) : (
          <>
            {tab === 'helix' && (
              <TripleHelix
                dimensions={dimensions}
                dimensionScores={dna?.dimensionScores || {}}
                confidence={dna?.confidence || {}}
              />
            )}
            {tab === 'radar' && <RadarChart history={history} />}
            {tab === 'breakdown' && <BreakdownBars history={history} />}
            {tab === 'timeline' && <Timeline history={history} />}
            {tab === 'history' && <HistoryList history={history} />}
            {tab === 'forecaster' && <Forecaster history={history} />}
          </>
        )}
      </div>

      {/* DNA String Modal */}
      {showDnaModal && dna && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }} onClick={() => setShowDnaModal(false)}>
          <div
            style={{
              maxWidth: 700, width: '100%', padding: 32, borderRadius: 16,
              background: '#0a0a0f', border: '1px solid rgba(108,143,255,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 18, color: '#fff', margin: 0 }}>Belief DNA String</h2>
              <button onClick={() => setShowDnaModal(false)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: 20, cursor: 'pointer',
              }}>&times;</button>
            </div>
            <DnaString
              dnaString={dna.dnaString}
              dimensionsCovered={dna.dimensionsCovered}
              totalResponses={dna.totalResponses}
              overallConfidence={dna.overallConfidence}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const headerBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8,
  background: 'transparent', border: '1px solid rgba(108,143,255,0.3)',
  color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6,
  fontFamily: "'Space Mono', monospace",
  transition: 'all 0.2s',
};
