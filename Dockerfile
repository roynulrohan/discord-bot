FROM node:17-slim

RUN apt-get update || : && apt-get install python -y

WORKDIR /usr/src/app/

COPY package*.json ./

RUN npm i

COPY src ./src

COPY .env ./

RUN ls

CMD ["npm", "start"]
