import { useState } from 'react';
import { Plus, Trash2, Copy, CheckCircle } from 'lucide-react';
import type { BuilderState } from '../../types';
import { generateSlug } from '../../lib/utils';
import { showToast } from '../ui/Toaster';

interface Props { state: BuilderState; update: (p: Partial<BuilderState>) => void; }

export default function Step5Personalize({ state, update }: Props) {
  const [newGuestName, setNewGuestName] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  function addGuest() {
    const name = newGuestName.trim();
    if (!name) return;

    const slug = generateSlug(name);
    if (state.guests.find(g => g.slug === slug)) {
      showToast('हे नाव आधीच आहे.', 'error');
      return;
    }

    update({ guests: [...state.guests, { name, slug }] });
    setNewGuestName('');
  }

  function removeGuest(slug: string) {
    update({ guests: state.guests.filter(g => g.slug !== slug) });
  }

  function getGuestLink(guestSlug: string) {
    const invSlug = state.slug || 'invitation';
    return `${window.location.origin}/invite/${invSlug}/${guestSlug}`;
  }

  async function copyLink(guestSlug: string) {
    await navigator.clipboard.writeText(getGuestLink(guestSlug));
    setCopiedSlug(guestSlug);
    showToast('Link copied! 📋', 'success');
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  const baseLink = `${window.location.origin}/invite/${state.slug || '[invitation-slug]'}`;

  return (
    <div className="space-y-6">
      <div className="gold-card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
            👥 Step 5 — Guest Personalization
          </h2>
          <p className="text-sm text-amber-700">Create personalized invitation links for each guest</p>
        </div>

        {/* Base link */}
        <div className="p-4 rounded-xl border mb-6" style={{ background: 'rgba(255,115,0,0.05)', borderColor: 'rgba(255,115,0,0.2)' }}>
          <p className="text-xs text-amber-600 mb-1">📎 सामान्य Invitation Link:</p>
          <p className="text-sm font-mono text-saffron-700 break-all">{baseLink}</p>
        </div>

        {/* Add guest */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 font-devanagari" style={{ color: '#3d1f00' }}>
            नवीन Guest जोडा
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newGuestName}
              onChange={e => setNewGuestName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGuest()}
              placeholder="Guest चे नाव (उदा: राहुल)"
              className="flex-1 px-4 py-3 rounded-xl border-2 text-sm outline-none focus:border-saffron-400 bg-white"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}
            />
            <button onClick={addGuest} className="btn-saffron px-4 py-3 text-sm flex-shrink-0">
              <Plus className="w-4 h-4" />
              जोडा
            </button>
          </div>
        </div>

        {/* Guest list */}
        {state.guests.length > 0 ? (
          <div>
            <p className="text-sm font-semibold mb-3 font-devanagari" style={{ color: '#3d1f00' }}>
              Guest List ({state.guests.length} guests)
            </p>
            <div className="space-y-2">
              {state.guests.map(guest => (
                <div
                  key={guest.slug}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(212,160,23,0.2)' }}
                >
                  <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-sm font-bold text-saffron-600 flex-shrink-0">
                    {guest.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm font-devanagari" style={{ color: '#3d1f00' }}>{guest.name}</p>
                    <p className="text-xs text-amber-500 truncate">/invite/.../{guest.slug}</p>
                  </div>
                  <button
                    onClick={() => copyLink(guest.slug)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-amber-50"
                    style={{ color: '#7a4c2a', border: '1px solid rgba(212,160,23,0.3)' }}
                  >
                    {copiedSlug === guest.slug ? (
                      <><CheckCircle className="w-3 h-3 text-green-500" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                  <button
                    onClick={() => removeGuest(guest.slug)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-devanagari text-amber-700 text-sm">अजून कोणताही guest जोडलेला नाही</p>
            <p className="text-xs text-amber-500 mt-1">Guests जोडल्यास personalized links तयार होतील</p>
          </div>
        )}
      </div>

      {/* Personalization preview */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold font-devanagari mb-3" style={{ color: '#3d1f00' }}>
          👁️ Personalization Preview
        </h3>
        <div className="p-4 rounded-xl border font-devanagari text-sm leading-relaxed"
          style={{ background: 'rgba(255,243,224,0.8)', borderColor: 'rgba(212,160,23,0.3)', color: '#3d1f00' }}>
          <p className="text-saffron-600 font-bold text-base mb-1">
            प्रिय {state.guests[0]?.name || 'राहुल'},
          </p>
          <p className="text-amber-700 text-xs mb-3">आपल्यासाठी खास आमंत्रण ❤️</p>
          <p className="whitespace-pre-wrap text-xs">{state.message.slice(0, 200)}...</p>
        </div>
      </div>
    </div>
  );
}
