import type { BuilderState, InvitationType } from '../../types';

const INVITATION_TYPES: { value: InvitationType; label: string; labelMr: string; icon: string }[] = [
  { value: 'individual', label: 'Individual', labelMr: 'व्यक्तिगत', icon: '👤' },
  { value: 'family', label: 'Family', labelMr: 'कौटुंबिक', icon: '👨‍👩‍👧‍👦' },
  { value: 'friends_group', label: 'Friends Group', labelMr: 'मित्र गट', icon: '👥' },
  { value: 'society', label: 'Society', labelMr: 'सोसायटी', icon: '🏘️' },
  { value: 'organization', label: 'Organization', labelMr: 'संस्था', icon: '🏢' },
];

interface Props { state: BuilderState; update: (p: Partial<BuilderState>) => void; }

function Field({ label, labelMr, required, children }: { label: string; labelMr?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: '#3d1f00' }}>
        {labelMr && <span className="font-devanagari">{labelMr}</span>}
        {labelMr && ' '}
        <span className="text-amber-700 font-normal">({label})</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors focus:border-saffron-400 bg-white";
const inputStyle = { borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' };

export default function Step1HostDetails({ state, update }: Props) {
  return (
    <div className="gold-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
          📝 Step 1 — तुमची माहिती
        </h2>
        <p className="text-sm text-amber-700">Host details for your invitation</p>
      </div>

      {/* Invitation type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3" style={{ color: '#3d1f00' }}>
          <span className="font-devanagari">आमंत्रणाचा प्रकार</span> (Invitation Type)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {INVITATION_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => update({ invitation_type: t.value })}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                state.invitation_type === t.value
                  ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                  : 'border-amber-200 hover:border-amber-300 text-amber-700 bg-white'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="font-devanagari">{t.labelMr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Host Name" labelMr="आपले नाव" required>
          <input
            type="text"
            value={state.host_name}
            onChange={e => update({ host_name: e.target.value })}
            placeholder="उदा: प्रशांत नलावडे"
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Family Name" labelMr="कुटुंबाचे नाव">
          <input
            type="text"
            value={state.family_name}
            onChange={e => update({ family_name: e.target.value })}
            placeholder="उदा: नलावडे परिवार"
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="City" labelMr="शहर" required>
          <input
            type="text"
            value={state.city}
            onChange={e => update({ city: e.target.value })}
            placeholder="उदा: पुणे"
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Mobile (Optional)" labelMr="मोबाइल">
          <input
            type="tel"
            value={state.mobile}
            onChange={e => update({ mobile: e.target.value })}
            placeholder="9876543210"
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Full Address" labelMr="पूर्ण पत्ता" required>
            <textarea
              value={state.address}
              onChange={e => update({ address: e.target.value })}
              placeholder="उदा: 101, शांती अपार्टमेंट, कोथरूड, पुणे - 411029"
              rows={3}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Landmark (Optional)" labelMr="खूण">
          <input
            type="text"
            value={state.landmark}
            onChange={e => update({ landmark: e.target.value })}
            placeholder="उदा: कोथरूड बस स्टॉप जवळ"
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <Field label="Google Maps Link (Optional)" labelMr="Maps Link">
          <input
            type="url"
            value={state.maps_url}
            onChange={e => update({ maps_url: e.target.value })}
            placeholder="https://maps.google.com/..."
            className={inputClass}
            style={inputStyle}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Family Story (Optional)" labelMr="आमच्या बाप्पांचा प्रवास">
            <textarea
              value={state.family_story}
              onChange={e => update({ family_story: e.target.value })}
              placeholder="उदा: आमच्या घरी गेल्या 15 वर्षांपासून गणपती बाप्पांची स्थापना केली जाते..."
              rows={3}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      {/* Example display */}
      {(state.host_name || state.family_name) && (
        <div className="mt-6 p-4 rounded-xl border" style={{ background: 'rgba(255,115,0,0.05)', borderColor: 'rgba(255,115,0,0.2)' }}>
          <p className="text-xs text-amber-600 mb-1">Preview:</p>
          <p className="font-bold font-devanagari" style={{ color: '#3d1f00' }}>
            {state.family_name || state.host_name}
            {state.family_name && state.host_name && state.family_name !== state.host_name ? '' : ' व परिवार'}
          </p>
        </div>
      )}
    </div>
  );
}
