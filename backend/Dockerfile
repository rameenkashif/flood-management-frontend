FROM node:20-alpine
WORKDIR /app

# Copy package manifest and install production deps
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund || npm install --only=production --no-audit --no-fund

# Copy app sources
COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
