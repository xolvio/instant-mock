FROM node:18-alpine AS build

WORKDIR /app
COPY ./frontend ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/frontend/build ./frontend/build
COPY ./backend ./backend
WORKDIR /app/backend
RUN npm install
# Install ts-node-dev globally
RUN npm install -g ts-node-dev
EXPOSE 3000
CMD ["ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]