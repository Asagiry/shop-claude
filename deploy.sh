#!/bin/bash
set -e

SSH_KEY="./id_ed25519"
SSH_USER="base-ubuntu"
SSH_IP="192.168.1.243"
REMOTE_DIR="/home/base-ubuntu/shop"
REPO_URL="https://github.com/Asagiry/shop-claude.git"

echo "=== Deploying E-Commerce Shop ==="

# Execute deployment on remote server
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$SSH_IP << ENDSSH
set -e

# Step 1: Pull/update code on the VM
if [ -d "$REMOTE_DIR/.git" ]; then
  echo ">>> Pulling latest code..."
  cd $REMOTE_DIR && git pull origin main
else
  echo ">>> Cloning repository..."
  git clone $REPO_URL $REMOTE_DIR
  cd $REMOTE_DIR
fi

cd $REMOTE_DIR

# Step 2: Install npm dependencies
echo ">>> Installing server dependencies..."
cd server && npm install && cd ..

echo ">>> Installing client dependencies..."
cd client && npm install && cd ..

# Step 3: Build server and run migrations
echo ">>> Building server (TypeScript)..."
cd server && npm run build && cd ..

echo ">>> Running database migrations..."
cd server && DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app node dist/db/migrate.js && cd ..

echo ">>> Seeding database..."
cd server && DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app node dist/db/seed.js && cd ..

# Step 4: Build React frontend
echo ">>> Building React frontend..."
cd client && npm run build && cd ..

# Step 5: Prepare static files
echo ">>> Copying frontend build to server/client..."
rm -rf server/client
cp -r client/dist server/client

echo ">>> Copying product assets..."
mkdir -p server/assets
cp -f assets/*.png server/assets/

mkdir -p server/uploads

# Step 6: Start under PM2 on port 80
echo ">>> Stopping existing PM2 processes..."
sudo pm2 delete shop 2>/dev/null || true

echo ">>> Starting application with PM2 on port 80..."
sudo PORT=80 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app JWT_SECRET=vibe-miner-shop-secret-key-2024 pm2 start server/dist/index.js --name shop
sudo pm2 save

echo ">>> Deployment complete!"
echo ">>> App running on http://claude-shop.voimaxgm.online"
ENDSSH

echo "=== Deployment finished ==="
