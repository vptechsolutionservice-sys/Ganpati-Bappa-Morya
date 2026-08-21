import { useState } from 'react';
import { Copy, CheckCircle, Share2, Lock } from 'lucide-react';
import { getWhatsAppShareUrl } from '../../lib/utils';
import { showToast } from '../ui/Toaster';
import { supabase } from '../../lib/supabase';

interface Props {
  invitationId: string;
  slug: string;
  hostName: string;
  guestName?: string;
  arrivalDate?: string;
  city?: string;
  message?: string;
  isUnlocked?: boolean;        // undefined = treat as unlocked (legacy)
  paymentInvitationId?: string; // to navigate to payment page
}

export default function ShareButtons({ invitationId, slug, hostName, guestName, arrivalDate, city, message, isUnlocked, paymentInvitationId }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/invite/${slug}`;

  // If explicitly set to false, show locked state
  const locked = isUnlocked === false;

  function buildWhatsAppMsg() {
    return `🙏 गणपती बाप्पा मोरया!

${guestName ? `प्रिय ${guestName},` : 'नमस्कार,'}

यंदा ${hostName} यांच्या घरी गणपती बाप्पांचे आगमन होत आहे.

आपण सहकुटुंब बाप्पांच्या दर्शनाला नक्की यावे, ही मनापासून विनंती. ❤️
${arrivalDate ? `\n🗓️ आगमन: ${arrivalDate}` : ''}
${city ? `📍 ${city}` : ''}

👇 खास आमंत्रण:
${url}

गणपती बाप्पा मोरया! मंगलमूर्ती मोरया! 🙏`;
  }

  async function trackShare(platform: string) {
    await supabase.from('invitation_shares').insert({ invitation_id: invitationId, platform });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Link copied!', 'success');
    await trackShare('copy');
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareWhatsApp() {
    await trackShare('whatsapp');
    window.open(getWhatsAppShareUrl(buildWhatsAppMsg()), '_blank');
  }

  async function shareTelegram() {
    await trackShare('telegram');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('🙏 गणपती बाप्पा मोरया!')}`, '_blank');
  }

  async function shareFacebook() {
    await trackShare('facebook');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }

  async function nativeShare() {
    await trackShare('native');
    if (navigator.share) {
      await navigator.share({ title: `गणपती आमंत्रण — ${hostName} 🙏`, text: buildWhatsAppMsg(), url });
    } else {
      await copyLink();
    }
  }

  return (
    <div className="space-y-3">
      {locked ? (
        // ─── LOCKED STATE ─────────────────────────────────────
        <div className="text-center">
          <div className="rounded-2xl p-6 mb-3"
            style={{ background: 'rgba(0,0,0,0.03)', border: '2px dashed rgba(212,160,23,0.3)' }}>
            <Lock className="w-8 h-8 mx-auto mb-3 text-amber-300" />
            <p className="font-devanagari text-sm font-semibold mb-1" style={{ color: '#3d1f00' }}>
              Sharing Locked 🔒
            </p>
            <p className="text-xs text-amber-600 mb-4">
              Pay ₹50 to unlock WhatsApp sharing, copy link, and guest links
            </p>
            {paymentInvitationId && (
              <a href={`/payment/${paymentInvitationId}`}
                className="btn-saffron inline-flex px-6 py-3 text-sm">
                🔒 Pay ₹50 & Unlock
              </a>
            )}
          </div>
          {[{ icon: '📱', label: 'WhatsApp Share' }, { icon: '🔗', label: 'Copy Link' }, { icon: '✈️', label: 'Telegram' }].map(f => (
            <div key={f.label} className="flex items-center gap-3 py-2.5 px-4 rounded-xl mb-2"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(212,160,23,0.15)' }}>
              <span className="text-base opacity-40">{f.icon}</span>
              <span className="flex-1 text-sm text-gray-400">{f.label}</span>
              <Lock className="w-3.5 h-3.5 text-amber-200" />
            </div>
          ))}
        </div>
      ) : (
        // ─── UNLOCKED STATE ───────────────────────────────────
        <>
          <a
            onClick={shareWhatsApp}
            href={getWhatsAppShareUrl(buildWhatsAppMsg())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full py-4 text-base cursor-pointer"
          >
            <span className="text-xl">📱</span>
            WhatsApp वर आमंत्रण पाठवा
          </a>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={shareTelegram}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-medium hover:bg-blue-50 transition-colors"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#2b6cb0' }}>
              ✈️ <span>Telegram</span>
            </button>
            <button onClick={shareFacebook}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-medium hover:bg-blue-50 transition-colors"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#1877f2' }}>
              👍 <span>Facebook</span>
            </button>
            <button onClick={nativeShare}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-medium hover:bg-amber-50 transition-colors"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              <Share2 className="w-4 h-4" /> <span>More</span>
            </button>
          </div>

          <button onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all hover:bg-amber-50"
            style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
            {copied ? <><CheckCircle className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Link Copy करा</>}
          </button>
        </>
      )}
    </div>
  );
}
