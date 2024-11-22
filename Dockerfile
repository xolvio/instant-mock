FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ARG REACT_APP_BACKEND_PORT
ENV REACT_APP_BACKEND_PORT=$REACT_APP_BACKEND_PORT
ARG REACT_APP_FRONTEND_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL
ARG REACT_APP_FRONTEND_PORT
ENV REACT_APP_FRONTEND_PORT=$REACT_APP_FRONTEND_PORT
ARG REACT_APP_FRONTEND_REQUIRE_AUTH
ENV REACT_APP_FRONTEND_REQUIRE_AUTH=$REACT_APP_FRONTEND_REQUIRE_AUTH

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build


FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci 

COPY backend/ .
RUN npm run build
RUN cp package.json dist/


FROM node:20-alpine AS final
WORKDIR /app

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=frontend-builder /app/frontend/build ./frontend/build

EXPOSE 3007
CMD ["/bin/sh", "-c", "cd /app/backend && node dist/server.js"]

