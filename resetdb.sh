docker compose down
docker volume rm farm_db_gf
docker volume rm farm_minio_data
docker compose up -d

rm -rf ./packages/database/prisma/migrations/
rm -rf packages/database/prisma/zod

rm -rf .next node_modules/.cache

pnpm --filter database migrate:init init_db

pnpm --filter scripts seed:user

pnpm dev