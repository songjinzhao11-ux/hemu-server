# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and assets
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy assets
# Ensure assets directory exists in source or handles missing assets gracefully
COPY --from=builder /app/assets ./assets

# Create directories for data and uploads
RUN mkdir -p uploads data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=./database/hemu.db

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
