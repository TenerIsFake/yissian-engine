# STAGE 1: Build the React Application
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# SYN-P1-4: Fail build if nginx.conf and nginx.conf.template have diverged on /api/ locations
RUN diff <(grep 'location /api\|location ~ \^/api\|location = /api' nginx.conf.template | sort) \
         <(grep 'location /api\|location ~ \^/api\|location = /api' nginx.conf | sort) \
    || (echo 'ERROR: nginx.conf and nginx.conf.template are out of sync on /api/ locations!' && exit 1)
RUN npm run build

# STAGE 2: Serve with Nginx (Internal Reverse Proxy)
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Template is processed by the nginx entrypoint via envsubst at container startup.
# API keys are injected from env vars — never baked into the image.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Non-root setup: run as nginx user
# NOTE: sed on default.conf is intentionally removed — nginx.conf.template (processed at startup
# by the nginx entrypoint via envsubst) overrides default.conf, so the sed was a no-op.
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

# P2-21: 30s start-period for cold-start resilience in WSL2
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1

USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
