module.exports = {
  apps: [{
    name: 'shop',
    script: './server/dist/index.js',
    cwd: '/home/base-ubuntu/shop',
    env: {
      NODE_ENV: 'production',
      PORT: 80,
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/app',
      JWT_SECRET: 'vibe-miner-shop-secret-key-2024',
    },
  }],
};
