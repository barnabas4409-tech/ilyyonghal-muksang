import { createClient } from 'jsr:@supabase/supabase-js@2';

// Web Push 발송 (VAPID 서명 직접 구현 — Deno 환경)
async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPrivateKey: string,
  vapidPublicKey: string,
  vapidSubject: string,
): Promise<void> {
  // VAPID JWT 생성
  const audience = new URL(subscription.endpoint).origin;
  const header = { alg: 'ES256', typ: 'JWT' };
  const claims = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: vapidSubject,
  };

  const encoder = new TextEncoder();
  function b64u(buf: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const claimsB64 = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const sigInput = encoder.encode(`${headerB64}.${claimsB64}`);

  // Import VAPID private key
  const rawPriv = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const privKey = await crypto.subtle.importKey(
    'pkcs8', rawPriv,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, sigInput);
  const jwt = `${headerB64}.${claimsB64}.${b64u(sig)}`;

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${vapidPublicKey}`,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body: encoder.encode(payload),
  });

  if (!res.ok && res.status !== 201) {
    console.error(`Push failed: ${res.status} ${subscription.endpoint}`);
  }
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const vapidPublicKey  = Deno.env.get('VAPID_PUBLIC_KEY')!;
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
  const vapidSubject    = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@ilyyonghal.com';

  const today = new Date().toISOString().split('T')[0];
  const currentHour = `${new Date().getUTCHours().toString().padStart(2, '0')}:00`;

  // 이 시간대에 알림 설정된 사용자 중 오늘 아직 묵상 안 한 사람
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, push_subscription, push_time')
    .eq('push_enabled', true)
    .eq('push_time', currentHour)
    .not('push_subscription', 'is', null);

  if (!profiles?.length) return new Response('no subscribers', { status: 200 });

  // 오늘 이미 묵상한 사람 제외
  const { data: doneToday } = await supabase
    .from('reflections')
    .select('user_id')
    .gte('created_at', `${today}T00:00:00.000Z`);

  const doneIds = new Set(doneToday?.map(r => r.user_id) ?? []);

  const pending = profiles.filter(p => !doneIds.has(p.id));

  const messages = [
    { title: '오늘 묵상 하셨나요? 📖', body: '말씀이 기다려요. 지금 시작해볼까요?', url: '/today' },
    { title: '하루를 말씀으로 시작해요', body: '오늘의 본문이 준비되어 있어요', url: '/today' },
    { title: '묵상 알림 🙏', body: '잠깐 말씀 앞에 머물러요', url: '/today' },
  ];
  const msg = messages[new Date().getDay() % messages.length];

  let sent = 0;
  for (const p of pending) {
    try {
      await sendWebPush(p.push_subscription, JSON.stringify(msg), vapidPrivateKey, vapidPublicKey, vapidSubject);
      sent++;
    } catch (e) {
      console.error('push error', p.id, e);
    }
  }

  return new Response(JSON.stringify({ sent, total: pending.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
