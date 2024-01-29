FROM node:18-alpine AS Production

ENV NODE_ENV=production

WORKDIR /app/src/hoop-easy-client

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
