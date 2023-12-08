FROM ghcr.io/hazmi35/node:20-dev as build-stage

RUN corepack enable && corepack prepare pnpm@latest

COPY . .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpx prisma generate && pnpm run build

RUN pnpm prune --production

FROM ghcr.io/hazmi35/node:20

COPY --from=build-stage /tmp/build/dist dist
COPY --from=build-stage /tmp/build/assets assets
COPY --from=build-stage /tmp/build/prisma prisma
COPY --from=build-stage /tmp/build/node_modules node_modules

CMD ["node", "dist/index.js"]