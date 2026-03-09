import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push'

/**
 * ⚡ ICPH CYBER-TRANSMITTER V2 (The Messenger)
 * Engineered by Infra-Shadow & Logic Core
 * Standard: TOP 1 IN THE COUNTRY
 */

const VAPID_PUBLIC_KEY = 'BKH7BoOj7ljVD4N-kodE_3R9i8nYNYNnixtEArucSeteDQUNOO6DBswRTpjtW_BeLIbntVjr3hbRbG1171GEmeA';
const VAPID_PRIVATE_KEY = 'if47jO7MvvJwXKFXOn_F0oxKwU_kUxDQvcIKc18NTUw';

webpush.setVapidDetails(
  'mailto:skorts188@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  try {
    const { record } = await req.json() // The new notification record

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Find the receiver's digital address
    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('rider_name', record.receiver_name)
      .single()

    if (sub && sub.subscription) {
      const payload = JSON.stringify({
        title: `ICPH HUB: ${record.sender_name}`,
        body: record.message,
        url: record.type === 'message' ? '/messenger.html' : '/index.html'
      });

      await webpush.sendNotification(sub.subscription, payload);
      console.log(`🚀 [SUCCESS] PUSH SENT TO: ${record.receiver_name}`);
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ skipped: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("❌ [PUSH ERROR]:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
})
