#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy || npx prisma db push

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed
fi

echo "Starting application..."
exec node server.js
