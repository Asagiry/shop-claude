#!/bin/bash
set -e

SSH_KEY="./id_ed25519"
SSH_USER="base-ubuntu"
SSH_IP="192.168.1.243"
REMOTE_DIR="/home/base-ubuntu/shop"

echo "=== Deploying E-Commerce Shop ==="

# Execute deployment on remote server
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$SSH_IP << 'ENDSSH'
set -e
cd /home/base-ubuntu/shop

echo ">>> Installing server dependencies..."
cd server && npm install && cd ..

echo ">>> Installing client dependencies..."
cd client && npm install && cd ..

echo ">>> Building server (TypeScript)..."
cd server && npm run build && cd ..

echo ">>> Running database migrations..."
cd server && node dist/db/migrate.js && cd ..

echo ">>> Seeding database..."
cd server && node dist/db/seed.js && cd ..

echo ">>> Building React frontend..."
cd client && npm run build && cd ..

echo ">>> Copying frontend build to server/client..."
rm -rf server/client
cp -r client/dist server/client

echo ">>> Copying assets to server/assets..."
mkdir -p server/assets
cp -f assets/*.png server/assets/

echo ">>> Creating uploads directory..."
mkdir -p server/uploads

echo ">>> Stopping existing PM2 processes..."
pm2 delete shop 2>/dev/null || true

echo ">>> Starting application with PM2 on port 80..."
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 start ecosystem.config.js
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 save

echo ">>> Deployment complete!"
echo ">>> App should be running on http://$HOSTNAME:80"
ENDSSH

echo "=== Deployment finished ==="
