module.exports = {
  apps: [{
    name: 'crackzone-api',
    script: 'server.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000
    },
    // Production optimizations
    node_args: process.env.NODE_ENV === 'production' ? '--max-old-space-size=1024' : '',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Auto restart on crash
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    // Graceful shutdown
    kill_timeout: 5000,
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};