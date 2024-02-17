FROM node:21.6.2-alpine as base

WORKDIR /app

RUN corepack enable
RUN apk add --no-cache python3 make g++

COPY pnpm-lock.yaml ./

RUN pnpm fetch

FROM base as build

WORKDIR /app

COPY tsup.config.ts package.json  ./
COPY src ./src

RUN pnpm install --frozen-lockfile --offline && \
    pnpm run build

FROM base as production-dependencies

WORKDIR /app

COPY package.json  ./
RUN pnpm prune --prod && \
    pnpm install --production --frozen-lockfile --offline && \
    pnpm store prune

FROM node:21.6.2-alpine as application

WORKDIR /app

COPY --from=production-dependencies --chown=node /app/node_modules ./node_modules
COPY --from=build --chown=node /app/dist ./

RUN echo '{"type":"module"}' > package.json

USER node

CMD node --enable-source-maps main.js
