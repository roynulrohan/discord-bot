FROM node:20.5.0

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /usr/local/apps/myapp

COPY package.json ./
RUN npm install

COPY tsconfig.json ./

COPY src ./src

COPY @types ./

RUN npm run build

EXPOSE ${PORT}

CMD ["node", "build/bot.js"]