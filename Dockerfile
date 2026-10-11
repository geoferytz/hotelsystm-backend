# HMS Express backend
FROM node:20-alpine

ENV NODE_ENV=production
# Default container port - can be overridden by compose env.
# nginx proxies to hotel-backend:8080, so keep this in sync.
ENV PORT=8080

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD ["node", "src/server.js"]
