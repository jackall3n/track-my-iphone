FROM node:14

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

ENV PORT 8080

EXPOSE 8080

CMD ["ts-node", "src/track"]
