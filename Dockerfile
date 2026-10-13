FROM node:24-alpine AS dependencies

RUN corepack enable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .husky/install.mjs ./.husky/install.mjs

ENV HUSKY=0
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS build

RUN corepack enable

WORKDIR /usr/src/app

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .

ARG API_BASE_URL
ARG TASKCOPER_API_BASE_URL
ARG FILE_BASE_URL
ARG SITE_URL
ARG GOONG_MAP_API_KEY
ARG CLOUDGO_CHANNEL_ID
ARG PUBLIC_VIETMAP_API_KEY
ARG ENABLE_ORDERING=true
ARG ENABLE_PAYMENT=true
ARG ENABLE_EXTERNAL_SERVICES=true

ARG SENTRY_RELEASE
ARG SENTRY_ENVIRONMENT

ENV NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}
ENV NEXT_PUBLIC_TASKCOPER_API_BASE_URL=${TASKCOPER_API_BASE_URL}
ENV NEXT_PUBLIC_FILE_BASE_URL=${FILE_BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${SITE_URL}
ENV NEXT_PUBLIC_GOONG_MAP_API_KEY=${GOONG_MAP_API_KEY}
ENV NEXT_PUBLIC_CLOUDGO_CHANNEL_ID=${CLOUDGO_CHANNEL_ID}
ENV NEXT_PUBLIC_VIETMAP_API_KEY=${PUBLIC_VIETMAP_API_KEY}
ENV NEXT_PUBLIC_ENABLE_ORDERING=${ENABLE_ORDERING}
ENV NEXT_PUBLIC_ENABLE_PAYMENT=${ENABLE_PAYMENT}
ENV NEXT_PUBLIC_ENABLE_EXTERNAL_SERVICES=${ENABLE_EXTERNAL_SERVICES}

ENV SENTRY_RELEASE=${SENTRY_RELEASE}
ENV NEXT_PUBLIC_SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}
ENV HUSKY=0

# Optional secret: without it the build succeeds but source maps aren't uploaded.
RUN --mount=type=secret,id=sentry_auth_token \
  SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" pnpm build

FROM node:24-alpine AS runner

WORKDIR /usr/src/app

# Server-only upstreams read at runtime by lib/api-upstream.ts. Declared in this
# stage only: `pnpm build` runs where Docker hostnames don't resolve, so
# prerendering keeps using the public API URLs. Empty falls back to them too.
ARG API_INTERNAL_BASE_URL
ARG TASKCOPER_API_INTERNAL_BASE_URL

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV API_INTERNAL_BASE_URL=${API_INTERNAL_BASE_URL}
ENV TASKCOPER_API_INTERNAL_BASE_URL=${TASKCOPER_API_INTERNAL_BASE_URL}

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next/standalone ./

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
