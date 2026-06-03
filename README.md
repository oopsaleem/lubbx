# supastarter for Next.js

supastarter is the ultimate starter kit for production-ready, scalable SaaS applications.

## Helpful links

- [📘 Documentation](https://supastarter.dev/docs/nextjs)
- [🚀 Demo](https://demo.supastarter.dev)

```sh
pnpm dlx shadcn@latest add sidebar -c apps/web

pnpm build --filter @repo/web


# update db ?
# Regenerate Prisma after schema change
pnpm --filter @repo/database generate
# Push schema to database
pnpm --filter @repo/database push


```


on prod env
```sh
pnpm install && pnpm build

pnpm --filter @repo/database generate
pnpm --filter @repo/database migrate
pnpm --filter @repo/database push

pm2 reload lubbx-web

pm2 logs lubbx-web --lines 50
```


hard reset the files
```sh
# 1. Delete the old running instance
pm2 delete lubbx-web

# 2. Start it fresh with the new configuration
pm2 start ecosystem.config.js

# 3. Save the new state so it survives reboots
pm2 save
```