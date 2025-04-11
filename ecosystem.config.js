module.exports = {
  apps: [
    {
      name: 'api_panic',
      script: './src/server.js',
      instances: 1,
      env: {
        NODE_ENV: 'development',
        MONGODB_URI: 'mongodb://admin:secret123@localhost:27017/bd_api?authSource=admin',
        PORT: 5050,
      },
      env_production: {
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb://admin:secret123@localhost:27017/bd_api?authSource=admin',
        PORT: 5050,
      },
      env_file: '.env',
    },
  ],
};
