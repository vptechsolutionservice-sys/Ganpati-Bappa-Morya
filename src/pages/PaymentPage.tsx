import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Invitation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/ui/Toaster';
import Navbar from '../components/layout/Navbar';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const price = 59; // Fixed ₹59

  useEffect(() => {
    if (invitationId) load();
  }, [invitationId]);

  async function load() {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (data) {
        const inv = data as Invitation;
        setInvitation(inv);
        // If already unlocked, redirect to status or preview
        if (inv.is_unlocked) {
          navigate(`/payment-status/${inv.payment_id || invitationId}`);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading invitation:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRazorpayCheckout() {
    if (submitting) return; // Prevent duplicate clicks
    setSubmitting(true);

    try {
      // 1. Create order on backend (Edge Function enforces 5900 paise = ₹59)
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
        body: {
          invitationId: invitationId,
          receipt: `inv_${invitationId?.slice(0, 10)}`
        }
      });

      if (orderError || !orderData?.success) {
        const errMsg = orderError?.message || orderData?.error || 'Failed to initialize payment';
        throw new Error(errMsg);
      }

      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }

      // 2. Configure & open Razorpay modal
      const options = {
        key: keyId,
        amount: orderData.amount || 5900,
        currency: orderData.currency || 'INR',
        name: 'Ganpati Bappa Invitation',
        description: 'Unlock Sharing & Premium Invitation Features',
        order_id: orderData.orderId,
        image: '/favicon.svg',
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setSubmitting(true);
            showToast('Verifying payment...', 'info');

            // 3. Verify payment signature on backend
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invitation_id: invitationId,
                user_id: user?.id,
              }
            });

            if (verifyError || !verifyData?.success) {
              showToast('Payment verification failed. Please contact support.', 'error');
              return;
            }

            showToast('Payment successful ✓', 'success');
            const targetId = verifyData.paymentId || response.razorpay_payment_id;
            navigate(`/payment-status/${targetId}`);
          } catch (err: any) {
            showToast(err.message || 'Verification error', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || invitation?.host_name || '',
          email: user?.email || '',
          contact: invitation?.mobile || '',
        },
        theme: {
          color: '#ff7300',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            showToast('Payment cancelled.', 'info');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setSubmitting(false);
        showToast(response?.error?.description || 'Payment failed. Please try again.', 'error');
      });
      rzp.open();

    } catch (err: any) {
      showToast(err.message || 'Payment initialization failed', 'error');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #fff8f0, #fdf0dc)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-float">🙏</div>
          <p className="text-amber-700 font-devanagari">Loading payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 60%, #fde8c8 100%)' }}>
      <Navbar />

      {/* Header */}
      <div className="text-center py-8 px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl mb-3">🙏</motion.div>
        <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-2xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>
          बाप्पांचे आमंत्रण अनलॉक करा
        </motion.h1>
        <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-amber-700 mt-1 text-sm">
          Pay ₹{price} to unlock WhatsApp sharing & all premium features
        </motion.p>
      </div>

      <div className="max-w-md mx-auto px-4 pb-16 space-y-5">

        {/* Invitation Preview Card */}
        {invitation && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="gold-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ff9233, #ff7300)' }}>
                {invitation.ganpati_image_url
                  ? <img src={invitation.ganpati_image_url} alt="Ganpati" className="w-full h-full object-cover" />
                  : <span className="text-3xl">🙏</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold font-devanagari truncate" style={{ color: '#3d1f00' }}>{invitation.host_name}</p>
                <p className="text-sm text-amber-700">{invitation.city}</p>
                <p className="text-xs text-amber-500">{invitation.arrival_date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold" style={{ color: '#ff7300' }}>₹{price}</p>
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <Lock className="w-3 h-3" /> Locked
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkout Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
          className="gold-card p-6 text-center shadow-xl">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(255,115,0,0.1)', color: '#ff7300', border: '1px solid rgba(255,115,0,0.25)' }}>
            <Sparkles className="w-3.5 h-3.5" /> One-time Payment
          </div>

          <div className="mb-6">
            <p className="text-sm text-amber-700 uppercase tracking-wider font-semibold">Total Amount</p>
            <p className="text-4xl font-extrabold mt-1" style={{ color: '#ff7300' }}>₹{price}</p>
            <p className="text-xs text-amber-600 mt-1">Inclusive of all features for this invitation</p>
          </div>

          {/* Features list */}
          <div className="text-left space-y-2.5 mb-6 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,160,23,0.2)' }}>
            {[
              'Direct WhatsApp Sharing with 1-click preview',
              'Unique personalized links for each family & guest',
              'Guest RSVP responses & Attendance counter',
              'Festive devotional background music & animations',
              'Lifetime access to view & download your invite',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Pay Button */}
          <button
            onClick={handleRazorpayCheckout}
            disabled={submitting}
            className="btn-saffron w-full py-4 text-base font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {submitting ? (
              <>
                <span className="animate-spin inline-block mr-1">⏳</span>
                <span>Opening Checkout...</span>
              </>
            ) : (
              <span>⚡ Pay ₹{price}</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-amber-600 mt-4">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Secure payment powered by Razorpay (UPI, Cards, Netbanking)</span>
          </div>
        </motion.div>

        {/* Back navigation */}
        <div className="text-center pb-4">
          {invitation?.slug && (
            <Link to={`/invite/${invitation.slug}`} className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900 underline underline-offset-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Preview Invitation
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
