// PM2 process config. Start with:  pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "quizyzone",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // Prefer setting secrets via the server environment or a .env file,
        // not in this committed file:
        // AUTH_SECRET: "...",
        // NEXT_PUBLIC_SITE_URL: "https://your-domain.com",
      },
    },
  ],
};
