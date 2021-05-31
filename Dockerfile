FROM node:14 as build

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

RUN yarn build



FROM node:14 as worker

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package.json .
COPY --from=build /usr/src/app/yarn.lock .
COPY --from=build /usr/src/app/.env.local .
COPY --from=build /usr/src/app/dist ./dist

RUN yarn --production

ENV PORT 8080

EXPOSE 8080

CMD ["yarn", "start:prod"]
