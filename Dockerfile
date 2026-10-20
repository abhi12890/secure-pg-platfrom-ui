# Multi-stage Angular + Nginx — security headers enabled
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
RUN apk add --no-cache wget \
    && addgroup -S nginxapp && adduser -S nginxuser -G nginxapp
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/secure-pg-frontend/browser /usr/share/nginx/html
RUN chown -R nginxuser:nginxapp /usr/share/nginx/html /var/cache/nginx /var/log/nginx \
    && touch /var/run/nginx.pid && chown nginxuser:nginxapp /var/run/nginx.pid
USER nginxuser
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
