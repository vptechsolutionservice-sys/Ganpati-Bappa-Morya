import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import { supabase } from '../../lib/supabase';
import { extractRSVPSettings, updateRSVPSettings } from '../../lib/rsvpService';
import type { RSVPSettings } from '../../types';
import { showToast } from '../../components/ui/Toaster';

function Toggle({ value, onChange, label, hint }: { value: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b" style={{ borderColor: 'rgba(212,160,23,0.15)' }}>
      <div>
        <p className="font-semibold text-sm" style={{ color: '#3d1f00' }}>{label}</p>
        <p className="text-xs text-amber-600 mt-0.5">{hint}</p>
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full relative transition-all flex-shrink-0 ${value ? '' : 'bg-gray-200'}`}
        style={value ? { background: 'linear-gradient(135deg, #ff9233, #ff7300)' } : {}}>
        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export default function DashboardRSVPSettings() {
  const { id: invitationId } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<any>(null);
  const [settings, setSettings] = useState<RSVPSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (invitationId) load(); }, [invitationId]);

  async function load() {
    const { data } = await supabase.from('invitations').select('*').eq('id', invitationId).single();
    if (data) {
      setInvitation(data);
      setSettings(extractRSVPSettings(data));
    }
    setLoading(false);
  }

  function update(key: keyof RSVPSettings, value: any) {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  }

  async function save() {
    if (!invitationId || !settings) return;
    setSaving(true);
    const { error } = await updateRSVPSettings(invitationId, settings);
    if (error) showToast(error, 'error');
    else showToast('Settings saved! ✓', 'success');
    setSaving(false);
  }

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #fff8f0, #fdf0dc)' }}>
        <div className="text-4xl animate-float">🙏</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <Link to={`/dashboard/invitations/${invitationId}/rsvp`}
          className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to RSVP Dashboard
        </Link>

        <h1 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>⚙️ RSVP Settings</h1>
        <p className="text-sm text-amber-700 mb-6">{invitation?.host_name}</p>

        <div className="space-y-5">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="gold-card p-6">
            <Toggle
              value={settings.rsvp_enabled}
              onChange={v => update('rsvp_enabled', v)}
              label="Enable RSVP"
              hint="Turn RSVP on/off for this invitation"
            />
            <Toggle
              value={settings.rsvp_allow_maybe}
              onChange={v => update('rsvp_allow_maybe', v)}
              label="Allow Maybe"
              hint="Show 'Maybe' as a response option"
            />
            <Toggle
              value={settings.rsvp_allow_message}
              onChange={v => update('rsvp_allow_message', v)}
              label="Allow Guest Message"
              hint="Let guests add an optional message"
            />
            <Toggle
              value={settings.rsvp_show_public_count}
              onChange={v => update('rsvp_show_public_count', v)}
              label="Show Public Attendance Count"
              hint="Display '🙏 X people are joining us!' on the invitation"
            />
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="gold-card p-6">
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d1f00' }}>
                Maximum People Per RSVP
              </label>
              <input type="number" value={settings.rsvp_max_per_person}
                onChange={e => update('rsvp_max_per_person', Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1} max={50}
                className="w-24 px-3 py-2 rounded-xl border text-sm text-center"
                style={{ borderColor: 'rgba(212,160,23,0.4)', color: '#3d1f00' }} />
              <p className="text-xs text-amber-500 mt-1">Counter maximum on the RSVP form (1-50)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d1f00' }}>
                RSVP Deadline
              </label>
              <input type="datetime-local"
                value={settings.rsvp_deadline ? new Date(settings.rsvp_deadline).toISOString().slice(0, 16) : ''}
                onChange={e => update('rsvp_deadline', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: 'rgba(212,160,23,0.4)', color: '#3d1f00' }} />
              <p className="text-xs text-amber-500 mt-1">
                After this time, guests cannot create or modify RSVPs. Leave empty for no deadline.
              </p>
              {settings.rsvp_deadline && (
                <button onClick={() => update('rsvp_deadline', null)}
                  className="text-xs text-red-500 mt-1 underline">Clear deadline</button>
              )}
            </div>
          </motion.div>

          <button onClick={save} disabled={saving}
            className="btn-saffron w-full py-4 text-base flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save RSVP Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
