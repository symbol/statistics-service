FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN npm install pm2 -g && npm install && npm run build

EXPOSE 4001

CMD ["pm2-runtime","dist/app.js"]