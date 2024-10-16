FROM node:20-alpine AS build

WORKDIR /app
COPY ./frontend ./frontend
WORKDIR /app/frontend
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm install
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=build /app/frontend/build ./frontend/build
COPY ./backend ./backend
# COPY ./certs ./certs      if you need SSL, put certs here
WORKDIR /app/backend
RUN npm install
# Install ts-node-dev globally
RUN npm install -g ts-node-dev
EXPOSE 3000
CMD ["ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]
