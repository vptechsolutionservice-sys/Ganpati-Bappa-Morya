import type { BuilderState } from '../../types';

interface Props { state: BuilderState; update: (p: Partial<BuilderState>) => void; }

const inputClass = "w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-colors focus:border-saffron-400 bg-white";
const inputStyle = { borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' };

function EventRow({ label, labelMr, icon, dateKey, timeKey, state, update }: {
  label: string; labelMr: string; icon: string;
  dateKey?: keyof BuilderState; timeKey?: keyof BuilderState;
  state: BuilderState; update: (p: Partial<BuilderState>) => void;
}) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(212,160,23,0.2)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="font-semibold text-sm font-devanagari" style={{ color: '#3d1f00' }}>{labelMr}</p>
          <p className="text-xs text-amber-600">{label}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {dateKey && (
          <div>
            <label className="text-xs text-amber-600 mb-1 block">तारीख (Date)</label>
            <input
              type="date"
              value={state[dateKey] as string || ''}
              onChange={e => update({ [dateKey]: e.target.value } as Partial<BuilderState>)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        )}
        {timeKey && (
          <div>
            <label className="text-xs text-amber-600 mb-1 block">वेळ (Time)</label>
            <input
              type="time"
              value={state[timeKey] as string || ''}
              onChange={e => update({ [timeKey]: e.target.value } as Partial<BuilderState>)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const DURATIONS = [1, 3, 5, 7, 10];

export default function Step2BappaDetails({ state, update }: Props) {
  return (
    <div className="gold-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
          🙏 Step 2 — बाप्पांची माहिती
        </h2>
        <p className="text-sm text-amber-700">Ganpati arrival and event schedule</p>
      </div>

      <div className="space-y-4">
        {/* Arrival */}
        <EventRow
          label="Bappa Arrival" labelMr="बाप्पांचे आगमन" icon="🚗"
          dateKey="arrival_date" timeKey="arrival_time"
          state={state} update={update}
        />

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold mb-3 font-devanagari" style={{ color: '#3d1f00' }}>
            उत्सव कालावधी (Celebration Duration)
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => update({ duration_days: d })}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  state.duration_days === d
                    ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                    : 'border-amber-200 text-amber-700 hover:border-amber-300 bg-white'
                }`}
              >
                {d} Day{d > 1 ? 's' : ''}
              </button>
            ))}
            <button
              onClick={() => update({ duration_days: 0 })}
              className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                !DURATIONS.includes(state.duration_days)
                  ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                  : 'border-amber-200 text-amber-700 hover:border-amber-300 bg-white'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Sthapana */}
        <EventRow
          label="Sthapana" labelMr="स्थापना" icon="🪷"
          dateKey="sthapana_date" timeKey="sthapana_time"
          state={state} update={update}
        />

        {/* Aarti - time only */}
        <div className="p-4 rounded-xl border" style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(212,160,23,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🪔</span>
            <div>
              <p className="font-semibold text-sm font-devanagari" style={{ color: '#3d1f00' }}>महाआरती</p>
              <p className="text-xs text-amber-600">Maha Aarti Time</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-amber-600 mb-1 block">वेळ (Time)</label>
            <input
              type="time"
              value={state.aarti_time}
              onChange={e => update({ aarti_time: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Prasad - time only */}
        <div className="p-4 rounded-xl border" style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(212,160,23,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🍛</span>
            <div>
              <p className="font-semibold text-sm font-devanagari" style={{ color: '#3d1f00' }}>महाप्रसाद</p>
              <p className="text-xs text-amber-600">Maha Prasad Time</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-amber-600 mb-1 block">वेळ (Time)</label>
            <input
              type="time"
              value={state.prasad_time}
              onChange={e => update({ prasad_time: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Visarjan */}
        <EventRow
          label="Visarjan" labelMr="विसर्जन" icon="🌊"
          dateKey="visarjan_date" timeKey="visarjan_time"
          state={state} update={update}
        />
      </div>
    </div>
  );
}
