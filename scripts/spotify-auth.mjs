#!/usr/bin/env node
/**
 * One-time: get a Spotify refresh token with the scopes the site and agent need.
 *
 * 1. developer.spotify.com/dashboard → your app → Settings → Redirect URIs → add
 *      http://127.0.0.1:8888/callback
 * 2. SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-auth.mjs
 * 3. Open the printed URL, approve, copy the refresh token into Vercel as SPOTIFY_REFRESH_TOKEN.
 */
import http from "node:http";
import crypto from "node:crypto";

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.");
  process.exit(1);
}

const redirect = "http://127.0.0.1:8888/callback";
const scopes = ["user-read-currently-playing", "user-read-recently-played", "user-top-read"].join(" ");
const state = crypto.randomBytes(12).toString("hex");
const url = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: "code",
  client_id: id,
  scope: scopes,
  redirect_uri: redirect,
  state,
})}`;

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url ?? "/", redirect);
  if (u.pathname !== "/callback") return res.writeHead(404).end();
  if (u.searchParams.get("state") !== state) return res.writeHead(400).end("State mismatch");
  const code = u.searchParams.get("code");
  if (!code) return res.writeHead(400).end(u.searchParams.get("error") ?? "No code");

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirect }),
  });
  const data = await tokenRes.json();
  if (!data.refresh_token) {
    res.writeHead(500).end("Token exchange failed, see terminal.");
    console.error(data);
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("Done. Go back to the terminal.");
    console.log(`\nSPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
    console.log(`Scopes granted: ${data.scope}`);
  }
  server.close();
});

server.listen(8888, "127.0.0.1", () => {
  console.log("Open this URL in your browser and approve:\n");
  console.log(url);
});
