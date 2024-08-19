FROM node:20-alpine AS build

WORKDIR /app
COPY ./frontend ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=build /app/frontend/build ./frontend/build
COPY ./backend ./backend
WORKDIR /app/backend
RUN npm install
EXPOSE 3001
