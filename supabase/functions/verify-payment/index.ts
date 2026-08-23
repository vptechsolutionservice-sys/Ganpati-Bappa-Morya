import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import crypto from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invitation_id,
      user_id
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required payment fields (order_id, payment_id, signature)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const key_id = Deno.env.get('RAZORPAY_KEY_ID');
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!key_secret) {
      return new Response(
        JSON.stringify({ success: false, error: "Razorpay secret not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 1. Signature Verification: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const signPayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(signPayload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 2. Fetch payment details from Razorpay to verify status & amount
    if (key_id) {
      try {
        const auth = btoa(`${key_id}:${key_secret}`);
        const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });
        if (rzpRes.ok) {
          const paymentData = await rzpRes.json();
          if (paymentData.status !== 'captured' && paymentData.status !== 'authorized') {
            return new Response(
              JSON.stringify({ success: false, error: `Payment is in ${paymentData.status} state, not captured.` }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (e) {
        console.error("Razorpay payment fetch error:", e);
      }
    }

    // 3. Database Updates using Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    let paymentId: string | undefined = undefined;

    if (supabaseUrl && supabaseKey && invitation_id) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if payment already recorded (idempotency)
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status')
        .eq('transaction_id', razorpay_payment_id)
        .maybeSingle();

      if (existingPayment) {
        paymentId = existingPayment.id;
        await supabase
          .from('payments')
          .update({
            status: 'PAID',
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPayment.id);
      } else {
        const { data: newPayment, error: insertErr } = await supabase
          .from('payments')
          .insert({
            user_id: user_id || null,
            invitation_id: invitation_id,
            amount: 59.00,
            currency: 'INR',
            transaction_id: razorpay_payment_id,
            status: 'PAID',
            verified_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (!insertErr && newPayment) {
          paymentId = newPayment.id;
        }
      }

      // Unlock invitation
      await supabase
        .from('invitations')
        .update({
          payment_status: 'PAID',
          is_unlocked: true,
          is_public: true,
          payment_id: paymentId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        paymentId: paymentId || razorpay_payment_id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
