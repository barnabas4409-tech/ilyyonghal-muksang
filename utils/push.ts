import { createClient } from '@/lib/supabase/client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

export async function subscribePush(userId: string): Promise<boolean> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return false;

  const reg = await registerServiceWorker();
  if (!reg) return false;

  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as ArrayBuffer,
    });
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ push_subscription: sub.toJSON(), push_enabled: true })
      .eq('id', userId);
    return true;
  } catch {
    return false;
  }
}

export async function unsubscribePush(userId: string): Promise<void> {
  const reg = await navigator.serviceWorker?.getRegistration('/sw.js');
  if (reg) {
    const sub = await reg.pushManager.getSubscription();
    await sub?.unsubscribe();
  }
  const supabase = createClient();
  await supabase
    .from('profiles')
    .update({ push_subscription: null, push_enabled: false })
    .eq('id', userId);
}

export async function isPushSubscribed(): Promise<boolean> {
  const reg = await navigator.serviceWorker?.getRegistration('/sw.js');
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}
