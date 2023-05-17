FROM node:20.1.0-alpine as base

WORKDIR /app

RUN corepack enable
RUN apk add --no-cache python3 make g++

COPY pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm fetch

COPY package.json .npmrc tsup.config.ts tsconfig.json ./
COPY src ./src

FROM base as build

WORKDIR /app

RUN pnpm install --frozen-lockfile --offline && \
    pnpm run build

FROM base as production-dependencies

WORKDIR /app

RUN pnpm install --production --frozen-lockfile --offline

FROM node:20.1.0-alpine as application

WORKDIR /app

COPY --from=production-dependencies --chown=node /app/node_modules ./node_modules
COPY --from=build --chown=node /app/dist ./

RUN echo '{"type":"module"}' > package.json

USER node

CMD node --enable-source-maps main.js
