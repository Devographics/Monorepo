# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /monorepo

# Install dependencies based on the preferred package manager
COPY yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Package.json for the monorepo but also PNPM workspace config
# /!\ This means workspace names must be the same as in the file,
# avoid naming the folder "app" instead keep it "surveyform"
COPY package.json .npmrc pnpm-workspace.yaml ./
# App dependency and shared code
# Be careful with the end "/" => no slash mean copy folder/file WITH this name,
# a slash mean copy IN this folder
COPY surveyadmin/package.json ./surveyadmin/
# TODO: we should copy only package.json, can we use a glob here?
COPY shared ./shared
# FIXME: not working in monorepo 
# See https://github.com/pnpm/pnpm/discussions/4247
# RUN \
#     if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#     elif [ -f package-lock.json ]; then npm ci; \
#     elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
#     else echo "Lockfile not found." && exit 1; \
#     fi
# FIXME: won't work either if we don't copy shared code 
# => we need a Dockerfile at the root instead
RUN yarn global add pnpm && pnpm i --no-optional;
RUN exit 0

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /monorepo
# Copy node_modules generated earlier in a first layer
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/shared ./shared
COPY --from=deps /monorepo/surveyadmin/node_modules ./surveyadmin/node_modules
# Copy code as well
COPY ./surveyadmin ./surveyadmin

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# RUN yarn build
WORKDIR /monorepo/surveyadmin
RUN yarn global add pnpm;
RUN pnpm build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /monorepo/surveyadmin/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /monorepo/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /monorepo/app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]