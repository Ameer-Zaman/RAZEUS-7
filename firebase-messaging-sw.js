/* firebase-messaging-sw.js
   Handles push notifications that arrive while the site is NOT open —
   fully closed browser/tab, phone locked, etc. Must live at the site
   root so its scope covers the whole origin.

   This does NOT handle the "tab is open" case — that's handled locally
   and instantly inside players.html itself for speed. This file only
   kicks in for background/closed-app delivery. */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB3E3vdJvjB88p-aTWLIw9Z6_HhYVA9EQM",
  authDomain: "mrz-war-table.firebaseapp.com",
  databaseURL: "https://mrz-war-table-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mrz-war-table",
  storageBucket: "mrz-war-table.firebasestorage.app",
  messagingSenderId: "427955707558",
  appId: "1:427955707558:web:fbb9eff081478179881e67"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '🔴 RZ7 LIVE';
  const body  = (payload.notification && payload.notification.body)  || 'Someone just went live!';
  const tag   = (payload.data && payload.data.tag) || 'rz7-live';

  self.registration.showNotification(title, {
    body: body,
    icon: 'images/logo/rz7_logo.jpeg',
    badge: 'images/logo/rz7_logo.jpeg',
    tag: tag,
    data: payload.data || {}
  });
});

// Tapping the notification focuses an already-open tab if there is one,
// otherwise opens the players page fresh.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('players.html');
    })
  );
});
