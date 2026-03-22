// Belief Genome profile — identity metadata + DNA prefix preview
import { useState, useEffect } from 'react';
import { useGenomeAuth, genomeApi } from '../../components/genome/GenomeAuthContext';
import DnaString from '../../components/genome/DnaString';

// ISO 3166-1 numeric codes (3-digit) — abstract in DNA string, no identifiable letters
const COUNTRIES = [
  { code: '', label: 'Select country...' },
  { code: '840', label: 'United States' }, { code: '826', label: 'United Kingdom' },
  { code: '124', label: 'Canada' }, { code: '036', label: 'Australia' },
  { code: '276', label: 'Germany' }, { code: '250', label: 'France' },
  { code: '392', label: 'Japan' }, { code: '076', label: 'Brazil' },
  { code: '356', label: 'India' }, { code: '484', label: 'Mexico' },
  { code: '410', label: 'South Korea' }, { code: '380', label: 'Italy' },
  { code: '724', label: 'Spain' }, { code: '528', label: 'Netherlands' },
  { code: '752', label: 'Sweden' }, { code: '578', label: 'Norway' },
  { code: '208', label: 'Denmark' }, { code: '246', label: 'Finland' },
  { code: '756', label: 'Switzerland' }, { code: '040', label: 'Austria' },
  { code: '056', label: 'Belgium' }, { code: '372', label: 'Ireland' },
  { code: '554', label: 'New Zealand' }, { code: '702', label: 'Singapore' },
  { code: '376', label: 'Israel' }, { code: '710', label: 'South Africa' },
  { code: '032', label: 'Argentina' }, { code: '152', label: 'Chile' },
  { code: '170', label: 'Colombia' }, { code: '616', label: 'Poland' },
  { code: '620', label: 'Portugal' }, { code: '643', label: 'Russia' },
  { code: '156', label: 'China' }, { code: '158', label: 'Taiwan' },
  { code: '764', label: 'Thailand' }, { code: '608', label: 'Philippines' },
  { code: '566', label: 'Nigeria' }, { code: '818', label: 'Egypt' },
  { code: '404', label: 'Kenya' }, { code: '288', label: 'Ghana' },
  { code: '784', label: 'UAE' }, { code: '682', label: 'Saudi Arabia' },
  { code: '792', label: 'Turkey' }, { code: '586', label: 'Pakistan' },
  { code: '050', label: 'Bangladesh' }, { code: '360', label: 'Indonesia' },
  { code: '458', label: 'Malaysia' }, { code: '704', label: 'Vietnam' },
  { code: '804', label: 'Ukraine' }, { code: '642', label: 'Romania' },
  { code: '203', label: 'Czech Republic' }, { code: '348', label: 'Hungary' },
  { code: '300', label: 'Greece' }, { code: '191', label: 'Croatia' },
  { code: '604', label: 'Peru' }, { code: '218', label: 'Ecuador' },
];

const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, width: '100%',
};

export default function ProfilePage() {
  const { user } = useGenomeAuth();
  const [profile, setProfile] = useState({
    birthYear: null as number | null, birthMonth: null as number | null,
    birthDay: null as number | null, sex: '5', countryCode: '', zipCode: '',
  });
  const [dna, setDna] = useState<any>(null);
  const [editName, setEditName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    genomeApi('/profile').then(r => r.json()).then(d => {
      setProfile({
        birthYear: d.birthYear, birthMonth: d.birthMonth, birthDay: d.birthDay,
        sex: d.sex || '5', countryCode: d.countryCode || '', zipCode: d.zipCode || '',
      });
    }).catch(() => {});
    genomeApi('/dna').then(r => r.json()).then(setDna).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await genomeApi('/profile', { method: 'PUT', body: JSON.stringify({ ...profile, name: editName }) });
    const dnaData = await genomeApi('/dna').then(r => r.json());
    setDna(dnaData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  };

  // Live DNA prefix preview
  const previewPrefix = (() => {
    const y = profile.birthYear;
    const century = y ? (y >= 2000 ? '1' : '0') : '0';
    const yy = y ? String(y).slice(-2).padStart(2, '0') : '00';
    const mm = profile.birthMonth ? String(profile.birthMonth).padStart(2, '0') : '00';
    const dd = profile.birthDay ? String(profile.birthDay).padStart(2, '0') : '00';
    const sex = profile.sex || '5';
    const cc = profile.countryCode ? profile.countryCode.replace(/[^0-9]/g, '').slice(0, 3).padStart(3, '0') : '000';
    const zip = profile.zipCode ? profile.zipCode.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).padEnd(5, '0') : '00000';
    return `${century}${yy}${mm}${dd}${sex}${cc}${zip}`;
  })();

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 32, color: '#fff' }}>Profile</h1>

      {/* Account */}
      <div style={{ padding: 20, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Account</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em' }}>Name</label>
            <input type="text" style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em' }}>Email</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>{user?.email || 'Unknown'}</div>
          </div>
        </div>
      </div>

      {/* Identity Metadata */}
      <div style={{ padding: 20, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Identity Metadata</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>
          This data forms the prefix of your 140-character Belief DNA string.
          Used for demographic and geographic belief analysis — never shared individually.
        </p>

        {/* Date of Birth */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Date of Birth</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10 }}>
            <div>
              <input type="number" min={1} max={12} placeholder="MM" style={{ ...inputStyle, textAlign: 'center' }}
                value={profile.birthMonth || ''} onChange={e => setProfile({ ...profile, birthMonth: e.target.value ? parseInt(e.target.value) : null })} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 2 }}>Month</div>
            </div>
            <div>
              <input type="number" min={1} max={31} placeholder="DD" style={{ ...inputStyle, textAlign: 'center' }}
                value={profile.birthDay || ''} onChange={e => setProfile({ ...profile, birthDay: e.target.value ? parseInt(e.target.value) : null })} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 2 }}>Day</div>
            </div>
            <div>
              <input type="number" min={1900} max={2099} placeholder="YYYY" style={inputStyle}
                value={profile.birthYear || ''} onChange={e => setProfile({ ...profile, birthYear: e.target.value ? parseInt(e.target.value) : null })} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Year</div>
            </div>
          </div>
        </div>

        {/* Gender */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Gender</label>
          <select style={inputStyle} value={profile.sex} onChange={e => setProfile({ ...profile, sex: e.target.value })}>
            <option value="5">Prefer not to say</option>
            <option value="0">Female</option>
            <option value="1">Male</option>
            <option value="2">Intersex</option>
            <option value="9">Non-binary / Other</option>
          </select>
        </div>

        {/* Country */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Country</label>
          <select style={inputStyle} value={profile.countryCode} onChange={e => setProfile({ ...profile, countryCode: e.target.value })}>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>

        {/* Zip */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Zip / Postal Code</label>
          <input type="text" maxLength={5} placeholder="00000" style={{ ...inputStyle, maxWidth: 160 }}
            value={profile.zipCode} onChange={e => setProfile({ ...profile, zipCode: e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 5) })} />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>5 characters max. Enter 00000 if your country does not use postal codes.</div>
        </div>

        {/* Prefix preview */}
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Belief Genome Prefix
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.18em', color: '#6c8fff' }}>
            {previewPrefix}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6, lineHeight: 1.6 }}>
            <strong>{previewPrefix[0]}</strong> century &middot;{' '}
            <strong>{previewPrefix.slice(1, 3)}</strong> year &middot;{' '}
            <strong>{previewPrefix.slice(3, 5)}</strong> month &middot;{' '}
            <strong>{previewPrefix.slice(5, 7)}</strong> day &middot;{' '}
            <strong>{previewPrefix[7]}</strong> gender &middot;{' '}
            <strong>{previewPrefix.slice(8, 11)}</strong> country &middot;{' '}
            <strong>{previewPrefix.slice(11, 16)}</strong> zip
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: '#6c8fff', color: '#fff', fontSize: 14,
            cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <span style={{ fontSize: 13, color: '#2ed573' }}>Saved</span>}
        </div>
      </div>

      {/* DNA String */}
      {dna && (
        <div style={{ padding: 20, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Your Belief DNA</h3>
          <DnaString dnaString={dna.dnaString} dimensionsCovered={dna.dimensionsCovered}
            totalResponses={dna.totalResponses} overallConfidence={dna.overallConfidence} />
        </div>
      )}
    </div>
  );
}
