// SECURITY: This dev proxy loads the production .env file (via loadEnv below).
// The dev server MUST remain bound to 127.0.0.1 (host: '127.0.0.1' in server config).
// Do NOT persist terminal output to disk — Tautulli and SABnzbd API keys appear in
// Vite's proxy request logs as URL query parameters.
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load .env so dev proxy can inject API keys as headers (matches nginx behaviour in prod)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api/plex/photo': { target: 'http://10.0.0.195:32400', changeOrigin: true, rewrite: path => path.replace(/^\/api\/plex\/photo/, '/photo'), headers: { 'X-Plex-Token': env.PLEX_TOKEN ?? '' } },
        '/api/plex':       { target: 'http://10.0.0.195:32400', changeOrigin: true, rewrite: path => path.replace(/^\/api\/plex/, ''),       headers: { 'X-Plex-Token': env.PLEX_TOKEN ?? '' } },
        '/api/tautulli-bridge': { target: 'http://10.0.0.195:8888', changeOrigin: true, rewrite: path => path.replace(/^\/api\/tautulli-bridge/, '') },
        '/api/tautulli':   { target: 'http://10.0.0.195:8181',  changeOrigin: true, rewrite: (path) => {
          // Strip the /api/tautulli prefix BEFORE building the URL (SABnzbd pattern)
          const u = new URL(path.replace(/^\/api\/tautulli/, ''), 'http://localhost');
          u.searchParams.set('apikey', env.TAUTULLI_API_KEY ?? '');
          return u.pathname + '?' + u.searchParams.toString();
        }},
        '/api/seerr':      { target: 'http://10.0.0.195:5055',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/seerr/, ''),    headers: { 'X-Api-Key': env.SEERR_API_KEY ?? '' } },
        '/api/radarr':     { target: 'http://10.0.0.195:7878',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/radarr/, ''),    headers: { 'X-Api-Key': env.RADARR_API_KEY ?? '' } },
        '/api/sonarr':     { target: 'http://10.0.0.195:8989',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/sonarr/, ''),    headers: { 'X-Api-Key': env.SONARR_API_KEY ?? '' } },
        '/api/lidarr':     { target: 'http://10.0.0.195:8686',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/lidarr/, ''),    headers: { 'X-Api-Key': env.LIDARR_API_KEY ?? '' } },
        '/api/prowlarr':   { target: 'http://10.0.0.195:9696',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/prowlarr/, ''),  headers: { 'X-Api-Key': env.PROWLARR_API_KEY ?? '' } },
        '/api/bazarr':     { target: 'http://10.0.0.195:6767',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/bazarr/, ''),    headers: { 'X-API-KEY': env.BAZARR_API_KEY ?? '' } },
        '/api/sabnzbd':    { target: 'http://10.0.0.195:8085',  changeOrigin: true, rewrite: (path) => {
          // 'http://localhost' is a URL parse-helper base, not the target — target above is authoritative
          const u = new URL(path.replace(/^\/api\/sabnzbd/, ''), 'http://localhost');
          u.searchParams.set('apikey', env.SABNZBD_API_KEY ?? '');
          return u.pathname + '?' + u.searchParams.toString();
        }},
        // DEV NOTE: qBittorrent targets 10.0.0.195:8080 (gluetun host port); prod nginx uses gluetun:8080.
        // The setPreferences write endpoint has NO secret-header guard in dev mode —
        // the 127.0.0.1 binding above is the only mitigation. Never expose the dev server beyond localhost.
        '/api/qbittorrent': { target: 'http://10.0.0.195:8080',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/qbittorrent/, ''), cookieDomainRewrite: 'localhost', headers: { 'Host': '10.0.0.195:8080', 'Origin': 'http://10.0.0.195:8080', 'Referer': 'http://10.0.0.195:8080/' } },
        '/api/notifiarr':          { target: 'http://10.0.0.195:5454',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/notifiarr/, '') },
        '/api/cloudflared':        { target: 'http://10.0.0.195:20241', changeOrigin: true, rewrite: path => path.replace(/^\/api\/cloudflared/, '') },
        '/api/flaresolverr':       { target: 'http://10.0.0.195:8191',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/flaresolverr/, '') },
        '/api/musicbrainz-applet': { target: 'http://10.0.0.195:5050',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/musicbrainz-applet/, '') },
        '/api/tunarr':             { target: 'http://10.0.0.155:8000',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/tunarr/, '') },
        '/api/musicbrainz-local':  { target: 'http://10.0.0.155:5000',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/musicbrainz-local/, '') },
        // gluetun REST API (port 8000) and media-bot are not host-exposed — these dev proxy entries
        // are non-functional. Use the deployed homepage container for gluetun/media-bot testing.
        '/api/gluetun':            { target: 'http://10.0.0.195:8000',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/gluetun/, '') },
        '/api/glances':            { target: 'http://10.0.0.195:61208', changeOrigin: true, rewrite: path => path.replace(/^\/api\/glances/, '') },
        '/api/glances2':           { target: 'http://10.0.0.155:61208', changeOrigin: true, rewrite: path => path.replace(/^\/api\/glances2/, '') },
        '/api/media-bot':          { target: 'http://10.0.0.195:8000',  changeOrigin: true, rewrite: path => path.replace(/^\/api\/media-bot/, '') },
        '/api/flask':              { target: 'http://localhost:5000',       changeOrigin: true, rewrite: path => path.replace(/^\/api\/flask/, '/api') },
        '/api/weather':            { target: 'https://api.open-meteo.com', changeOrigin: true, rewrite: path => path.replace(/^\/api\/weather/, ''), secure: true },
        '/api/quotes':             { target: 'https://zenquotes.io',       changeOrigin: true, rewrite: path => path.replace(/^\/api\/quotes/, '/api'),  secure: true },
        '/api/history':            { target: 'https://en.wikipedia.org',   changeOrigin: true, rewrite: path => path.replace(/^\/api\/history/, '/api/rest_v1/feed/onthisday'), secure: true },
      }
    },
    build: { outDir: 'dist' },
  }
})
