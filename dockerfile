# Etapa de build
FROM node:18 AS build-stage

WORKDIR /app

COPY package.json /app/package.json
RUN npm install --silent

COPY . /app
RUN npm run build

# Etapa de produção
FROM node:18 AS production-stage

WORKDIR /app

RUN npm install -g http-server

COPY --from=build-stage /app/build /app/build

EXPOSE 11435

CMD ["http-server", "build", "-p", "11435", "--cors"]
