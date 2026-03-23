# Nginx Proxy Reference

The full location block map, rate limit zones, security headers, and secrets injection design are documented in the shared vault:

**`vault/07_Operations/nginx-proxy-reference.md`**

---

## Quick Reference

### Files
- `nginx.conf.template` — Docker-authoritative (envsubst processes at startup)
- `nginx.conf` — dev-reference copy; must match `.template` on all `/api/` blocks
- The Dockerfile build step diffs these files; drift causes the build to fail

### Rate Limit Zones (defined in `nginx.conf.template` http context)
| Zone | Rate | Purpose |
|------|------|---------|
| `api_general` | 300r/m | Standard endpoints |
| `api_write` | 5r/m | POST-capable write endpoints |
| `api_glances` | 150r/m | Glances metrics (isolated zone) |

### Adding a New Location Block
1. Add block to `nginx.conf.template`
2. Add identical block to `nginx.conf`
3. Include `limit_except GET HEAD { deny all; }` unless the endpoint requires write methods
4. For LAN-only endpoints, add the four `allow`/`deny` lines
5. Add `limit_req zone=api_general burst=60 nodelay;`
6. Inject API keys via `proxy_set_header` — never in `proxy_pass` URLs
7. Rebuild: `docker compose up -d --build homepage`

### Secret Injection
All API keys come from `~/.secrets/flask-backend.env` via envsubst. They appear in `proxy_set_header` directives, not URLs. Tautulli and SABnzbd are exceptions (URL params only); those locations use `access_log off`.
