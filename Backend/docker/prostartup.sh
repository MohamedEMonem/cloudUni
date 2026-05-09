#!/usr/bin/env sh

# Exit immediately if a command exits with a non-zero status.
# Exit immediately if an undefined variable is used.
set -eu

echo "Starting production initialization..."

# 1. Run Database Migrations
# In production, we ONLY use 'migrate deploy'. We never use 'db push' 
# because 'db push' can drop tables and destroy live data to force a sync.
echo "Applying database migrations..."
npx prisma migrate deploy

# 2. Handle Seeding (Strictly Opt-In)
# In production, you rarely want to seed on every deployment. 
# We default this to false, so it only runs if you explicitly pass RUN_SEED=true in your environment.
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "RUN_SEED is enabled. Seeding the database..."
  # Use the compiled version of your seed script if using TypeScript
  node dist/prisma/seed.js 
else
  echo "Skipping database seed."
fi

# 3. Start the Application
echo "Starting production server..."
# 'exec' is critical here. It replaces the shell process with the Node process.
# This ensures Node receives shutdown signals (SIGTERM) directly from Docker, allowing for graceful shutdowns.
exec node dist/server.js