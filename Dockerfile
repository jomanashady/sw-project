# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source files
COPY backend/ ./

# Build the application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE 10000

# Start the application
CMD ["npm", "run", "start:prod"]

