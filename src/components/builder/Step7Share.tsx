import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, Share2, Download, ExternalLink, Lock } from 'lucide-react';
import type { BuilderState } from '../../types';
import { getWhatsAppShareUrl } from '../../lib/utils';
import { showToast } from '../ui/Toaster';
import { getLatestPaymentForInvitation } from '../../lib/paymentService';
import { supabase } from '../../lib/supabase';

interface Props {
  state: BuilderState;
  saveInvitation: () => Promise<{ slug: string; invitationId: string } | null>;
}

export default function Step7Share({ state, saveInvitation }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = window.location.origin;
  const invitationSlug = state.slug || 'invitation';
  const inviteUrl = `${baseUrl}/invite/${invitationSlug}`;

  useEffect(() => {
    if (state.savedInvitationId) {
      checkPaymentStatus(state.savedInvitationId);
    } else {
      setLoading(false);
    }
  }, [state.savedInvitationId]);

  async function checkPaymentStatus(invId: string) {
    setLoading(true);
    // Check invitation unlock status directly
    const { data: inv } = await supabase
      .from('invitations')
      .select('is_unlocked, payment_status, payment_id')
      .eq('id', invId)
      .single();

    if (inv?.is_unlocked) {
      setIsUnlocked(true);
      setPaymentStatus('PAID');
    } else {
      // Check latest payment
      const p = await getLatestPaymentForInvitation(invId);
      if (p) {
        setPaymentStatus(p.status);
        setPaymentId(p.id);
      }
    }
    setLoading(false);
  }

  function generateWhatsAppMessage(guestName?: string) {
    const greet = guestName ? `प्रिय ${guestName},` : 'नमस्कार,';
    const link = guestName
      ? `${inviteUrl}/${state.guests.find(g => g.name === guestName)?.slug || ''}`
      : inviteUrl;

    return `🙏 गणपती बाप्पा मोरया!\n\n${greet}\n\nयंदा ${state.host_name || state.family_name} यांच्या घरी गणपती बाप्पांचे आगमन होत आहे.\n\nआपण सहकुटुंब बाप्पांच्या दर्शनाला नक्की यावे, ही मनापासून विनंती. ❤️\n\n🗓️ आगमन: ${state.arrival_date || ''}\n📍 ${state.city || ''}\n\n👇 तुमच्यासाठी खास आमंत्रण:\n${link}\n\nगणपती बाप्पा मोरया! मंगलमूर्ती मोरया! 🙏`;
  }

  async function copyLink(url: string, key: string) {
    await navigator.clipboard.writeText(url);
    setCopied(key);
    showToast('Link copied!', 'success');
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({ title: `${state.host_name || state.family_name} - गणपती आमंत्रण 🙏`, text: generateWhatsAppMessage(), url: inviteUrl });
    } else {
      await copyLink(inviteUrl, 'native');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3 animate-float">🙏</div>
        <p className="text-amber-700">Loading share options...</p>
      </div>
    );
  }

  // ─── UNLOCKED STATE ───────────────────────────────────────────
  if (isUnlocked) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 250 }}
            className="text-6xl mb-4">🎉</motion.div>
          <h2 className="text-2xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>
            आमंत्रण तयार आहे! 🙏
          </h2>
          <p className="text-amber-700">Your invitation is unlocked and ready to share!</p>
        </div>

        {/* Invitation link */}
        <div className="gold-card p-6">
          <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>📎 Invitation Link</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl border mb-4"
            style={{ background: 'rgba(255,115,0,0.05)', borderColor: 'rgba(255,115,0,0.2)' }}>
            <p className="flex-1 text-sm font-mono text-saffron-700 break-all">{inviteUrl}</p>
            <button onClick={() => copyLink(inviteUrl, 'main')} className="flex-shrink-0">
              {copied === 'main' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-amber-500" />}
            </button>
          </div>
          <Link to={`/invite/${invitationSlug}`} target="_blank"
            className="flex items-center gap-2 text-sm text-saffron-600 hover:text-saffron-700">
            <ExternalLink className="w-4 h-4" /> Invitation उघडा
          </Link>
        </div>

        {/* Share buttons */}
        <div className="gold-card p-6">
          <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>📱 Share करा</h3>
          <div className="space-y-3">
            <a href={getWhatsAppShareUrl(generateWhatsAppMessage())} target="_blank" rel="noopener noreferrer"
              className="btn-whatsapp w-full py-4 text-base">
              <span className="text-xl">📱</span> WhatsApp वर आमंत्रण पाठवा
            </a>
            <button onClick={() => copyLink(inviteUrl, 'copy')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all hover:bg-amber-50"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              {copied === 'copy' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              Link Copy करा
            </button>
            <button onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all hover:bg-amber-50"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
              <Share2 className="w-5 h-5" /> More Share Options
            </button>
          </div>
        </div>

        {/* Guest links */}
        {state.guests.length > 0 && (
          <div className="gold-card p-6">
            <h3 className="text-lg font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>👥 Personalized Guest Links</h3>
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
                    <a href={getWhatsAppShareUrl(waMsg)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-white"
                      style={{ background: '#25d366' }}>
                      <span>📱</span> WA
                    </a>
                    <button onClick={() => copyLink(guestUrl, guest.slug)}
                      className="p-1.5 rounded-lg hover:bg-amber-50"
                      style={{ color: '#7a4c2a', border: '1px solid rgba(212,160,23,0.3)' }}>
                      {copied === guest.slug ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/dashboard" className="btn-outline-saffron px-8 py-3">Dashboard पहा →</Link>
        </div>
      </div>
    );
  }

  // ─── LOCKED STATE ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>
          आमंत्रण तयार आहे!
        </h2>
        <p className="text-amber-700 text-sm">Preview is completely free.</p>
      </div>

      {/* Pending state */}
      {paymentStatus === 'PENDING' && (
        <div className="gold-card p-6 text-center"
          style={{ borderColor: '#fbbf24', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
          <div className="text-4xl mb-3">⏳</div>
          <h3 className="font-bold font-devanagari" style={{ color: '#3d1f00' }}>Payment Verification Pending</h3>
          <p className="text-sm text-amber-700 mt-2 mb-4">Admin verify केल्यावर sharing unlock होईल.</p>
          {paymentId && (
            <button onClick={() => navigate(`/payment-status/${paymentId}`)}
              className="btn-outline-saffron w-full py-3">
              View Payment Status →
            </button>
          )}
        </div>
      )}

      {/* Locked features */}
      {paymentStatus !== 'PENDING' && (
        <div className="gold-card p-6">
          <div className="space-y-3">
            {[
              { icon: '📱', label: 'Share on WhatsApp' },
              { icon: '🔗', label: 'Copy Public Link' },
              { icon: '⬇️', label: 'Download Invitation' },
              { icon: '👥', label: 'Personalized Guest Links' },
              { icon: '📊', label: 'RSVP & Analytics' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 py-3 px-4 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(212,160,23,0.15)' }}>
                <span className="text-xl opacity-50">{icon}</span>
                <span className="flex-1 text-sm text-amber-600">{label}</span>
                <Lock className="w-4 h-4 text-amber-300" />
              </div>
            ))}
          </div>

          {paymentStatus === 'REJECTED' && (
            <div className="mt-4 p-3 rounded-xl text-sm text-center"
              style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626' }}>
              ❌ Previous payment was rejected. Please try again.
            </div>
          )}

          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
            <p className="text-3xl font-bold mb-1" style={{ color: '#ff7300' }}>₹59</p>
            <p className="text-xs text-amber-500 mb-4">one-time • per invitation</p>
            <button
              onClick={() => state.savedInvitationId && navigate(`/payment/${state.savedInvitationId}`)}
              disabled={!state.savedInvitationId}
              className="btn-saffron w-full py-4 text-base"
            >
              🔒 Pay ₹59 & Share My Invitation
            </button>
            <p className="text-xs text-amber-500 mt-3 font-devanagari">
              गणपती बाप्पा मोरया! मंगलमूर्ती मोरया! 🙏
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link to="/dashboard" className="btn-outline-saffron px-8 py-3">Dashboard पहा →</Link>
      </div>
    </div>
  );
}
