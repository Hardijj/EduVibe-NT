const VAPID_PUBLIC = 'BFQe3gbumuWcVGq-HwzVlCz72z0VE_m6D2AlQFYl8IFwNpqGP2bTWwSJIqur9toFk4nK6Cc52S_x93YeERrMrm4'; // Replace this!

function urlB64ToUint8(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4);
  const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

window.enablePush = async function () {
  if (!('serviceWorker' in navigator)) return alert('❌ Browser doesn’t support Service Workers');

  const reg = await navigator.serviceWorker.register('/sw.js');

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8(VAPID_PUBLIC)
  });

  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub)
  });

  alert('✅ You will now receive notifications!');
};
