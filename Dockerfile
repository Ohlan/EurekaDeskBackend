FROM node:14.15.2-alpine as builder
WORKDIR /app
RUN apk add --no-cache python2 make g++
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:14.15.2-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 8000
CMD ["node", "dist/index.js"]
