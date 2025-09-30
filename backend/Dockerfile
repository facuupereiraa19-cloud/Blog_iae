# Use Node.js LTS
FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Expose port
ENV PORT=5000
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
