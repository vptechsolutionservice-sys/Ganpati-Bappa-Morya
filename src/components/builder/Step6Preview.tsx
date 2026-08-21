import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { BuilderState } from '../../types';
import InvitationCard from '../ganpati/InvitationCard';
import { getPaymentSettings, getLatestPaymentForInvitation } from '../../lib/paymentService';

interface Props {
  state: BuilderState;
}

export default function Step6Preview({ state }: Props) {
  const navigate = useNavigate();
  const [price, setPrice] = useState(50);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    getPaymentSettings().then(s => setPrice(s.invitation_price));
  }, []);

  useEffect(() => {
    if (state.savedInvitationId) {
      setCheckingPayment(true);
      getLatestPaymentForInvitation(state.savedInvitationId).then(p => {
        if (p) {
          setPaymentStatus(p.status);
          setPaymentId(p.id);
        }
        setCheckingPayment(false);
      });
    }
  }, [state.savedInvitationId]);

  const invitation = {
    id: 'preview',
    user_id: undefined,
    slug: state.slug || 'preview',
    invitation_type: state.invitation_type,
    host_name: state.host_name || 'प्रशांत नलावडे',
    family_name: state.family_name || 'नलावडे परिवार',
    city: state.city || 'पुणे',
    address: state.address || 'कोथरूड, पुणे',
    landmark: state.landmark,
    mobile: state.mobile,
    family_photo_url: state.family_photo_url,
    maps_url: state.maps_url,
    arrival_date: state.arrival_date || new Date().toISOString().split('T')[0],
    arrival_time: state.arrival_time || '10:00',
    sthapana_date: state.sthapana_date,
    sthapana_time: state.sthapana_time,
    aarti_time: state.aarti_time,
    prasad_time: state.prasad_time,
    visarjan_date: state.visarjan_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    visarjan_time: state.visarjan_time || '18:00',
    duration_days: state.duration_days,
    message: state.message,
    template_id: state.template_id,
    theme: state.theme,
    ganpati_image_url: state.ganpati_image_url,
    background: state.background,
    show_flowers: state.show_flowers,
    show_toran: state.show_toran,
    show_diyas: state.show_diyas,
    show_rangoli: state.show_rangoli,
    show_bells: state.show_bells,
    show_particles: state.show_particles,
    show_mandala: state.show_mandala,
    music_enabled: state.music_enabled,
    family_story: state.family_story,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  function handlePayNow() {
    if (state.savedInvitationId) {
      navigate(`/payment/${state.savedInvitationId}`);
    }
  }

  function handleViewStatus() {
    if (paymentId) navigate(`/payment-status/${paymentId}`);
  }

  const isPaid = paymentStatus === 'PAID';
  const isPending = paymentStatus === 'PENDING';
  const isRejected = paymentStatus === 'REJECTED';

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
          👁️ पूर्वावलोकन
        </h2>
        <p className="text-sm text-amber-700">तुमचे invitation कसे दिसेल ते पहा</p>
      </div>

      {/* Invitation preview */}
      <div className="max-w-lg mx-auto">
        <InvitationCard
          invitation={invitation}
          guestName={state.guests[0]?.name}
          previewMode
        />
      </div>

      {/* Payment CTA section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-lg mx-auto mt-6"
      >
        {/* Already PAID */}
        {isPaid && (
          <div className="gold-card p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold font-devanagari text-lg" style={{ color: '#16a34a' }}>Payment Approved!</h3>
            <p className="text-sm text-amber-700 mt-1 mb-4">तुमचे invitation unlock झाले आहे. आता share करा!</p>
            <button onClick={() => navigate(`/invite/${state.slug}`)} className="btn-saffron w-full py-3">
              📱 Share Invitation →
            </button>
          </div>
        )}

        {/* PENDING */}
        {isPending && (
          <div className="gold-card p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderColor: '#fbbf24' }}>
            <div className="text-4xl mb-2">⏳</div>
            <h3 className="font-bold font-devanagari text-base" style={{ color: '#3d1f00' }}>Verification Pending</h3>
            <p className="text-sm text-amber-700 mt-1 mb-4">Admin verify केल्यावर invitation unlock होईल.</p>
            <button onClick={handleViewStatus} className="btn-outline-saffron w-full py-3">
              View Payment Status →
            </button>
          </div>
        )}

        {/* REJECTED or no payment */}
        {(isRejected || (!paymentStatus && !checkingPayment)) && (
          <div className="gold-card p-6">
            {isRejected && (
              <div className="text-center mb-4 p-3 rounded-xl"
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>❌ Previous payment was rejected</p>
                <p className="text-xs text-amber-700 mt-0.5">You can submit a new payment below</p>
              </div>
            )}

            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold font-devanagari" style={{ color: '#3d1f00' }}>
                तुमचे आमंत्रण तयार आहे!
              </h3>
              <p className="text-sm text-amber-600 mt-1">Preview is completely free.</p>
            </div>

            {/* Locked features */}
            <div className="rounded-xl p-4 mb-5 space-y-2"
              style={{ background: 'rgba(255,115,0,0.05)', border: '1px solid rgba(255,115,0,0.15)' }}>
              <p className="text-xs font-semibold text-amber-700 mb-2">Pay ₹{price} to unlock:</p>
              {[
                '📱 WhatsApp Share',
                '🔗 Public Invitation Link',
                '⬇️ Download Invitation',
                '👥 Personalized Guest Links',
                '📊 RSVP & Analytics',
                '🎊 Full Interactive Experience',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#7a4c2a' }}>
                  <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Price badge */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: '#ff7300' }}>₹{price}</p>
                <p className="text-xs text-amber-500">one time • per invitation</p>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={!state.savedInvitationId}
              className="btn-saffron w-full py-4 text-base"
            >
              {!state.savedInvitationId
                ? '⌛ Saving invitation...'
                : `🔒 Pay ₹${price} & Share`}
            </button>

            {!state.savedInvitationId && (
              <p className="text-xs text-center text-amber-500 mt-2">
                Please click "Finalize & Share" first to save your invitation
              </p>
            )}

            <p className="text-xs text-center text-amber-500 mt-3 font-devanagari">
              फक्त आमंत्रण नाही… बाप्पांच्या आगमनाचा एक सुंदर अनुभव. 🙏❤️
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
