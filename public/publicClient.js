/* 1️⃣  PUT YOUR VAPID PUBLIC KEY HERE  */
const VAPID_PUBLIC = 'BFQe3gbumuWcVGq-HwzVlCz72z0VE_m6D2AlQFYl8IFwNpqGP2bTWwSJIqur9toFk4nK6Cc52S_x93YeERrMrm4';

const uint8 = b64 =>
  Uint8Array.from(atob((b64 + '='.repeat((4 - b64.length % 4) % 4))
    .replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

/* one global, imported in index.html or any React component */
window.enablePush = async function () {
  if (!('serviceWorker' in navigator)) {
    alert('❌ Service-worker not supported'); return;
  }

  /* avoid double prompts */
  if (Notification.permission === 'denied') {
    return alert('❌ You blocked notifications in this browser');
  }
  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
  }

  const reg = await navigator.serviceWorker.register('/sw.js');
  let sub = await reg.pushManager.getSubscription();

  /* subscribe only if we don’t already have one */
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: uint8(VAPID_PUBLIC)
    });
  }

  /* skip network if already synced */
  const cached = localStorage.getItem('push-sent');
  if (cached !== sub.endpoint) {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    localStorage.setItem('push-sent', sub.endpoint);
  }

  alert('✅ Notifications enabled');
};
