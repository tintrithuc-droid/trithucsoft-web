FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production TZ=Asia/Ho_Chi_Minh
RUN apk add --no-cache tzdata
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p uploads && chown -R node:node uploads
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/robots.txt >/dev/null || exit 1
CMD ["node", "server.js"]
