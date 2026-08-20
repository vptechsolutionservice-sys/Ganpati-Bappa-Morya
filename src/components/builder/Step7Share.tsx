import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, CheckCircle, Share2, Download, ExternalLink } from 'lucide-react';
import type { BuilderState } from '../../types';
import { getWhatsAppShareUrl } from '../../lib/utils';
import { showToast } from '../ui/Toaster';

interface Props {
  state: BuilderState;
  saveInvitation: () => Promise<{ slug: string; invitationId: string } | null>;
}

export default function Step7Share({ state, saveInvitation }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = window.location.origin;
  const invitationSlug = state.slug || 'invitation';
  const inviteUrl = `${baseUrl}/invite/${invitationSlug}`;

  function generateWhatsAppMessage(guestName?: string) {
    const greet = guestName ? `प्रिय ${guestName},` : 'नमस्कार,';
    const link = guestName
      ? `${inviteUrl}/${state.guests.find(g => g.name === guestName)?.slug || ''}`
      : inviteUrl;

    return `🙏 गणपती बाप्पा मोरया!

${greet}

यंदा ${state.host_name || state.family_name} यांच्या घरी गणपती बाप्पांचे आगमन होत आहे.

आपण सहकुटुंब बाप्पांच्या दर्शनाला नक्की यावे, ही मनापासून विनंती. ❤️

🗓️ आगमन: ${state.arrival_date || ''}
📍 ${state.city || ''}

👇 तुमच्यासाठी खास आमंत्रण:
${link}

गणपती बाप्पा मोरया! मंगलमूर्ती मोरया! 🙏`;
  }

  async function copyLink(url: string, key: string) {
    await navigator.clipboard.writeText(url);
    setCopied(key);
    showToast('Link copied!', 'success');
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({
        title: `${state.host_name || state.family_name} - गणपती आमंत्रण 🙏`,
        text: generateWhatsAppMessage(),
        url: inviteUrl,
      });
    } else {
      await copyLink(inviteUrl, 'native');
    }
  }

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>
          आमंत्रण तयार आहे! 🙏
        </h2>
        <p className="text-amber-700">Your invitation is ready to share!</p>
      </div>

      {/* Invitation link */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>
          📎 तुमचे Invitation Link
        </h3>

        <div className="flex items-center gap-3 p-3 rounded-xl border mb-4"
          style={{ background: 'rgba(255,115,0,0.05)', borderColor: 'rgba(255,115,0,0.2)' }}>
          <p className="flex-1 text-sm font-mono text-saffron-700 break-all">{inviteUrl}</p>
          <button onClick={() => copyLink(inviteUrl, 'main')} className="flex-shrink-0">
            {copied === 'main' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-amber-500" />}
          </button>
        </div>

        <Link
          to={`/invite/${invitationSlug}`}
          target="_blank"
          className="flex items-center gap-2 text-sm text-saffron-600 hover:text-saffron-700"
        >
          <ExternalLink className="w-4 h-4" />
          Invitation उघडा
        </Link>
      </div>

      {/* Share buttons */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>
          📱 Share करा
        </h3>

        <div className="space-y-3">
          {/* WhatsApp */}
          <a
            href={getWhatsAppShareUrl(generateWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full py-4 text-base"
          >
            <span className="text-xl">📱</span>
            WhatsApp वर आमंत्रण पाठवा
          </a>

          {/* Copy link */}
          <button
            onClick={() => copyLink(inviteUrl, 'copy')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all hover:bg-amber-50"
            style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}
          >
            {copied === 'copy' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            Link Copy करा
          </button>

          {/* Native share */}
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all hover:bg-amber-50"
            style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}
          >
            <Share2 className="w-5 h-5" />
            More Share Options
          </button>
        </div>
      </div>

      {/* Personalized guest links */}
      {state.guests.length > 0 && (
        <div className="gold-card p-6">
          <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>
            👥 Personalized Guest Links
          </h3>
          <div className="space-y-2">
            {state.guests.map(guest => {
              const guestUrl = `${inviteUrl}/${guest.slug}`;
              const waMsg = generateWhatsAppMessage(guest.name);
              return (
                <div key={guest.slug} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(212,160,23,0.2)' }}>
                  <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-sm font-bold text-saffron-600 flex-shrink-0">
                    {guest.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm font-devanagari" style={{ color: '#3d1f00' }}>{guest.name}</p>
                    <p className="text-xs text-amber-500 truncate">{guestUrl}</p>
                  </div>
                  <a
                    href={getWhatsAppShareUrl(waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                    style={{ background: '#25d366' }}
                  >
                    <span>📱</span> WA
                  </a>
                  <button
                    onClick={() => copyLink(guestUrl, guest.slug)}
                    className="p-1.5 rounded-lg hover:bg-amber-50"
                    style={{ color: '#7a4c2a', border: '1px solid rgba(212,160,23,0.3)' }}
                  >
                    {copied === guest.slug ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Go to dashboard */}
      <div className="text-center">
        <Link to="/dashboard" className="btn-outline-saffron px-8 py-3">
          Dashboard पहा →
        </Link>
      </div>

      {/* Viral CTA */}
      <div className="text-center py-6 border-t" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
        <p className="text-sm font-devanagari text-amber-700 mb-3">
          तुमच्या मित्रांसाठीही असे सुंदर आमंत्रण तयार करा 🙏
        </p>
        <Link to="/create" className="text-saffron-600 text-sm font-medium hover:text-saffron-700">
          माझे मोफत आमंत्रण तयार करा ✨
        </Link>
      </div>
    </div>
  );
}
