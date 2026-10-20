# RZ7 Security Fix — Setup Guide

## What This Fixes

1. **Firebase database is wide open** — anyone can write/delete data from the browser console
2. **Phone numbers in notify_subscribers are publicly readable**
3. **Discord webhook is exposed in source code** (admin panel)
4. **No inspect/devtools protection** on most pages

---

## Step 1 — Deploy Firebase Security Rules (2 minutes)

This is the most critical fix. It locks your database so only authenticated users can write.

1. Go to https://console.firebase.google.com
2. Click your project (**mrz-war-table**)
3. Left sidebar → **Realtime Database**
4. Click the **Rules** tab
5. **Delete everything** in the editor
6. Paste the contents of `database.rules.json` (included in this zip)
7. Click **Publish**

### What these rules do:

| Path | Read | Write | Why |
|---|---|---|---|
| roster | Public | Auth only | Everyone sees players, only admin edits |
| live_players | Public | Auth only | Site shows live status, Worker writes via secret |
| live_viewers | Public | Auth only | Same as above |
| wars | Public | Auth only | War table is public, admin edits |
| events | Public | Auth only | Events page is public, admin edits |
| media | Public | Auth only | Media page is public, admin edits |
| presence | Public | Public | Visitor counter needs anonymous writes |
| notify_subscribers | **Auth only** | Auth only | Contains phone numbers — locked down |
| fcm_tokens | Auth only | Public | Push notification tokens from visitors |
| Everything else | Blocked | Blocked | No access to unknown paths |

**Important:** Your Cloudflare Worker uses a Firebase Database Secret (`?auth=SECRET`), which **bypasses all rules**. So the Worker will keep working perfectly after these rules are published. The admin panel will need Firebase Auth (Step 2).

---

## Step 2 — Enable Firebase Auth for Admin Panel (5 minutes)

After publishing the rules, the admin panel can't write to Firebase anymore (since it has no auth). Fix this:

1. Firebase Console → left sidebar → **Authentication**
2. Click **Get started**
3. Click **Email/Password** → toggle **Enable** → Save
4. Click **Users** tab → **Add user**
5. Enter your admin email and a strong password
6. Do the same for any other admin (e.g. cipher)

Now update the admin panel login to use Firebase Auth instead of the hardcoded password hash. The admin panel file (`admin-pointtable.html`) needs the Firebase Auth SDK added and the login function changed to use `firebase.auth().signInWithEmailAndPassword()`.

---

## Step 3 — Deploy shield.js (1 minute)

Copy `shield.js` to your site root (same folder as index.html). All 6 HTML files in this zip already reference it. When deployed:

- Right-click is blocked
- F12, Ctrl+Shift+I, Ctrl+U are blocked
- Page content blurs if devtools is detected open
- Debugger traps pause execution in console
- Console is cleared with a warning message every 2 seconds
- Text selection is blocked on player cards and data
- Image dragging is blocked

---

## Step 4 — Rotate the Discord Webhook (2 minutes)

Your admin panel has this webhook in the source code:
```
https://discord.com/api/webhooks/1513130756870766854/iXLM...
```

Anyone who views source can use it to spam your channel.

1. In Discord: Server Settings → Integrations → Webhooks
2. Delete the current webhook
3. Create a new one, copy the URL
4. Update it in admin-pointtable.html

---

## Verification

After all steps, test from an incognito window:

1. Open browser console on players.html
2. Try: `firebase.database().ref('roster').set({test: true})`
3. Should get: **PERMISSION_DENIED** ✓
4. Try: `firebase.database().ref('notify_subscribers').once('value', s => console.log(s.val()))`
5. Should get: **PERMISSION_DENIED** ✓ (phone numbers are now locked)
6. Try right-clicking → should be blocked ✓
7. Try F12 → should be blocked ✓
8. If devtools opens via browser menu → page blurs ✓
