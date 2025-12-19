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

# Expose the port the app listens on (Railway sets PORT, currently 8080)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"]

