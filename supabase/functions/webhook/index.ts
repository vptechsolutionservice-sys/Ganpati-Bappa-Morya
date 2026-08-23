import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import crypto from "node:crypto"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    const rawBody = await req.text();
    let eventData: any = {};

    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
    }

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const event = eventData.event;
    const paymentEntity = eventData.payload?.payment?.entity;
    const orderEntity = eventData.payload?.order?.entity;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      if (event === 'payment.captured' || event === 'order.paid') {
        const paymentId = paymentEntity?.id || eventData.payload?.payment?.entity?.id;
        const invitationId = paymentEntity?.notes?.invitationId || orderEntity?.notes?.invitationId;
        const amount = (paymentEntity?.amount || 5900) / 100;

        if (paymentId) {
          // Check if payment already exists
          const { data: existing } = await supabase
            .from('payments')
            .select('id, status')
            .eq('transaction_id', paymentId)
            .maybeSingle();

          let dbPaymentId = existing?.id;

          if (existing) {
            await supabase
              .from('payments')
              .update({
                status: 'PAID',
                verified_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);
          } else if (invitationId) {
            const { data: inserted } = await supabase
              .from('payments')
              .insert({
                invitation_id: invitationId,
                amount: amount,
                currency: 'INR',
                transaction_id: paymentId,
                status: 'PAID',
                verified_at: new Date().toISOString()
              })
              .select('id')
              .single();
            if (inserted) dbPaymentId = inserted.id;
          }

          if (invitationId) {
            await supabase
              .from('invitations')
              .update({
                payment_status: 'PAID',
                is_unlocked: true,
                is_public: true,
                payment_id: dbPaymentId || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', invitationId);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
