FROM node:20.5.0

WORKDIR /usr/local/apps/myapp

COPY package.json ./

RUN npm install

COPY src ./src

EXPOSE ${PORT}

CMD ["node", "build/bot.js"]