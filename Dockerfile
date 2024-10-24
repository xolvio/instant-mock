# Frontend Build Stage (Production Only)
FROM node:20-alpine AS frontend
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
WORKDIR /app/frontend
COPY ./frontend ./
RUN npm install && npm run build

# Backend Build Stage
FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY ./backend ./
RUN npm install

# Final Runtime Image for Backend (Production)
FROM node:20-alpine
WORKDIR /app/backend
COPY --from=backend /app/backend ./
COPY --from=frontend /app/frontend/build ./frontend/build  # Serve frontend build from backend
EXPOSE 3000
CMD ["npm", "start"]
