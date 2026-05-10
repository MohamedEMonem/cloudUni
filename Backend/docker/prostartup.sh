#!/usr/bin/env sh
set -eu

echo "--- Container Startup Debug Info ---"
echo "Current User: $(whoami)"
echo "Working Directory: $(pwd)"
echo "NODE_ENV: ${NODE_ENV:-undefined}"

# Check for DATABASE_URL specifically
if [ -z "${DATABASE_URL:-}" ]; then
  echo "CRITICAL ERROR: DATABASE_URL environment variable is missing!"
  echo "Check Elastic Beanstalk Environment Properties."
  exit 1
else
  # Masking the password for security: postgres://user:pass@host -> postgres://****@host
  MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/****:****@/')
  echo "DATABASE_URL is set to: $MASKED_URL"
fi
echo "------------------------------------"

echo "Starting production initialization..."

echo "Applying database migrations..."
# If this fails, the 'set -e' will catch it and the debug prints above will be in your logs
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "RUN_SEED is enabled. Seeding the database..."
  node dist/prisma/seed.js 
else
  echo "Skipping database seed."
fi

echo "Starting production server..."
exec node dist/server.js