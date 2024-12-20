FROM node:22.12.0-alpine as base

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml ./
RUN corepack enable

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store/v3 \
    pnpm fetch

FROM base as build

WORKDIR /app

COPY tsup.config.ts  ./
COPY src ./src

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store/v3 \
    pnpm install --frozen-lockfile --offline && \
    pnpm run build

FROM base as production-dependencies

WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store/v3 \
    pnpm prune --prod && \
    pnpm install --production --frozen-lockfile --offline

FROM node:22.12.0-alpine as application

WORKDIR /app

COPY --from=production-dependencies --chown=node /app/node_modules ./node_modules
COPY --from=build --chown=node /app/dist ./
COPY --from=base --chown=node /app/package.json ./

USER node

CMD node --enable-source-maps main.js
