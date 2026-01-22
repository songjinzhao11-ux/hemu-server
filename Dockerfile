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

# Create empty directories for storage (uploads and database)
RUN mkdir -p storage/uploads storage/database

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV UPLOAD_PATH=./storage/uploads
ENV DATABASE_PATH=./storage/database/hemu.db

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
