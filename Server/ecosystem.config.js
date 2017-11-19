module.exports = {
  apps : [
    {
      name: 'Political Capital',
      script: './server.js',
      watch: true,
      env: {
        'PORT': 3000,
        'NODE_ENV': 'production',
        'REACT_APP_DEBUG': 'false',
      },
      env_production: {
        'PORT': 3000,
        'NODE_ENV': 'production',
        'REACT_APP_DEBUG': 'false',
      },
    }
  ]
}