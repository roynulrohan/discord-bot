FROM node:17-slim

RUN apt-get update || : && apt-get install python -y

WORKDIR /usr/local/apps/myapp

COPY package.json ./
RUN npm install && npm cache clean --force

COPY tsconfig.json ./

COPY src ./src

COPY @types ./

COPY .env ./

EXPOSE ${PORT}

RUN npm i -g typescript

RUN tsc

CMD ["node", "./build/bot.js"]