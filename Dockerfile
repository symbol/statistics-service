FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN NODE_OPTIONS="--dns-result-order=ipv4first" npm install pm2 -g && npm install && npm run build

EXPOSE 4001

CMD ["pm2-runtime","dist/app.js"]