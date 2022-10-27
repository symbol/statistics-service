FROM node:lts-alpine

WORKDIR /app

COPY . .

ENV NODE_OPTIONS="--dns-result-order=ipv4first"

RUN npm install pm2 -g && npm install && npm run build

EXPOSE 4001

CMD ["pm2-runtime","dist/app.js"]