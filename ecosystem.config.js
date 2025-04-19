module.exports = {
  apps: [
    {
      name: 'api_panic',
      script: './src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_file: '.env', // este se encargará de cargar las variables desde el archivo creado por el workflow
    },
  ],
};
