# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend dependencies and install
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source files and build
COPY frontend/ .
RUN npm run build


# Stage 2: Build the backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Copy backend dependencies and install
COPY backend/package*.json ./
RUN npm install

# Copy backend source files and compile TypeScript
COPY backend/ .
RUN npm run build  # Ensure this compiles TypeScript to `dist`


# Final stage with both frontend and backend
FROM node:20-alpine AS final
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy entrypoint script and make it executable
# COPY entrypoint.sh /app/entrypoint.sh
# RUN chmod +x /app/entrypoint.sh

# Copy backend and frontend build outputs
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Set the entrypoint to the script
# ENTRYPOINT ["/app/entrypoint.sh"]

# Expose the port and start the server
EXPOSE 3000
CMD ["node", "backend/dist/server.js"]
