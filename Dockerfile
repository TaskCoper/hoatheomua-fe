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

ENV NEXT_PUBLIC_API_BASE_URL=${API_BASE_URL}
ENV NEXT_PUBLIC_TASKCOPER_API_BASE_URL=${TASKCOPER_API_BASE_URL}
ENV NEXT_PUBLIC_FILE_BASE_URL=${FILE_BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${SITE_URL}
ENV NEXT_PUBLIC_GOONG_MAP_API_KEY=${GOONG_MAP_API_KEY}
ENV NEXT_PUBLIC_CLOUDGO_CHANNEL_ID=${CLOUDGO_CHANNEL_ID}
ENV NEXT_PUBLIC_VIETMAP_API_KEY=${PUBLIC_VIETMAP_API_KEY}
ENV HUSKY=0

RUN pnpm build

FROM node:24-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next/standalone ./

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
