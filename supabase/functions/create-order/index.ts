import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fixed server-controlled amount (₹59 = 5900 paise)
const PAYMENT_AMOUNT = 5900;
const PAYMENT_CURRENCY = "INR";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { receipt, invitationId } = body;

    const key_id = Deno.env.get('RAZORPAY_KEY_ID')
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!key_id || !key_secret) {
      return new Response(
        JSON.stringify({ success: false, error: "Razorpay credentials missing in environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const uniqueReceipt = receipt || (invitationId ? `inv_${invitationId.slice(0, 10)}_${Date.now()}` : `rec_${Date.now()}`);
    const auth = btoa(`${key_id}:${key_secret}`);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: PAYMENT_AMOUNT,
        currency: PAYMENT_CURRENCY,
        receipt: uniqueReceipt.slice(0, 40),
        notes: {
          invitationId: invitationId || '',
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: data?.error?.description || data?.error || "Order creation failed" }),
        { status: response.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: key_id
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
