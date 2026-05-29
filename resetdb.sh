docker compose down
docker volume rm supa-new_db-supa-new
# docker volume rm supa-new_minio_data

docker compose up -d

pnpm store prune

rm -rf ./packages/database/prisma/migrations/
rm -rf ./packages/database/prisma/zod

pnpm --filter database migrate:init init_db

pnpm --filter scripts seed:user

