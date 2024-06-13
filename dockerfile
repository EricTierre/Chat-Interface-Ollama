FROM node:18 AS build-stage

WORKDIR /app

COPY package.json /app/package.json
RUN npm install --silent

COPY . /app
RUN npm run build

FROM node:18 AS production-stage

WORKDIR /app

RUN npm install -g serve

COPY --from=build-stage /app/build /app/build

EXPOSE 11435

CMD ["serve", "-s", "build", "-l", "11435"]