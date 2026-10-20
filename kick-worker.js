/*
  RZ7 — Live Status Worker (Kick + YouTube)
  ──────────────────────────────────────────
  Deploys to Cloudflare Workers (free tier). Checks whether a Kick or
  YouTube channel is currently live, from the server side — avoiding the
  browser CORS/free-proxy failures that public proxies like
  api.allorigins.win run into (rate limits, downtime, blocked origins).

    GET https://<your-worker>.workers.dev/?platform=kick&slug=some-channel
    -> { "platform": "kick", "id": "some-channel", "isLive": true }

    GET https://<your-worker>.workers.dev/?platform=youtube&handle=SomeHandle
    -> { "platform": "youtube", "id": "SomeHandle", "isLive": true }

  KICK checks use Kick's OFFICIAL public API (api.kick.com/public/v1)
  via an OAuth "app access token" (client_credentials grant) — the
  sanctioned access route, not blocked by Kick's Cloudflare bot
  protection the way generic CORS proxies are.

  YOUTUBE checks fetch the channel's public "/@handle/live" page
  directly from the Worker (server-to-server, no CORS involved) and
  look for YouTube's live-status markers in the page.

  ⚠️ DO NOT put your real Kick Client ID / Client Secret anywhere in
  this file. Leave `env.KICK_CLIENT_ID` / `env.KICK_CLIENT_SECRET`
  exactly as they are — the real values only ever go into the
  Cloudflare dashboard's Settings → Variables and Secrets, never here.

  SETUP
  1. Kick Developer Dashboard → create an app → copy Client ID/Secret.
  2. https://dash.cloudflare.com → Workers & Pages → Create Worker.
  3. Paste this whole file in, unedited, then Deploy.
  4. Worker → Settings → Variables and Secrets → Add:
        KICK_CLIENT_ID      = <your client id>
        KICK_CLIENT_SECRET  = <your client secret>
     Save/redeploy.
  5. Copy the Worker's URL and paste it into LIVE_STATUS_WORKER_URL
     near the top of the auto-detection script in players.html.
*/

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getKickAppToken(env) {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry - 60000) return cachedToken;

  const res = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.KICK_CLIENT_ID,
      client_secret: env.KICK_CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error('Kick token request failed: ' + res.status);
  const data = await res.json();
  cachedToken = data.access_token;
  cachedTokenExpiry = now + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function checkKick(slug, env) {
  const token = await getKickAppToken(env);
  const apiRes = await fetch(
    `https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(slug)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!apiRes.ok) return false;
  const data = await apiRes.json();
  const channel = data && data.data && data.data[0];
  return !!(channel && channel.stream && channel.stream.is_live);
}

async function checkYoutube(handle) {
  const res = await fetch(`https://www.youtube.com/@${encodeURIComponent(handle)}/live`, {
    headers: {
      // A normal browser UA avoids some lightweight bot-filtering on YouTube's side
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) return false;
  const html = await res.text();
  return html.includes('"isLive":true') ||
         html.includes('"isLiveNow":true') ||
         html.includes('{"style":"LIVE"');
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const platform = (url.searchParams.get('platform') || '').toLowerCase();
    const jsonHeaders = { 'Content-Type': 'application/json', ...CORS_HEADERS };

    try {
      if (platform === 'kick') {
        const slug = url.searchParams.get('slug');
        if (!slug) {
          return new Response(JSON.stringify({ error: 'missing ?slug=' }), { status: 400, headers: jsonHeaders });
        }
        const isLive = await checkKick(slug, env);
        return new Response(JSON.stringify({ platform: 'kick', id: slug, isLive }), { headers: jsonHeaders });
      }

      if (platform === 'youtube') {
        const handle = url.searchParams.get('handle');
        if (!handle) {
          return new Response(JSON.stringify({ error: 'missing ?handle=' }), { status: 400, headers: jsonHeaders });
        }
        const isLive = await checkYoutube(handle);
        return new Response(JSON.stringify({ platform: 'youtube', id: handle, isLive }), { headers: jsonHeaders });
      }

      return new Response(JSON.stringify({ error: 'unknown or missing ?platform= (use "kick" or "youtube")' }), {
        status: 400,
        headers: jsonHeaders,
      });
    } catch (err) {
      // Fail soft — never break the page, just report "not live"
      return new Response(JSON.stringify({ platform, isLive: false, error: String(err) }), {
        status: 200,
        headers: jsonHeaders,
      });
    }
  },
};