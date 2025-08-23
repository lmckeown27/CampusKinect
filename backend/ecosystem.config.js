module.exports = {
  apps: [{
    name: 'campusconnect',
    script: 'src/server.js',
    instances: 1, // Only one instance to prevent conflicts
    exec_mode: 'fork', // Single process mode
    autorestart: true, // Auto-restart on crashes
    watch: false, // Disable file watching in production
    max_memory_restart: '1G', // Restart if memory exceeds 1GB
    kill_timeout: 5000, // Graceful shutdown timeout
    wait_ready: true, // Wait for 'ready' event before marking as ready
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Process management
    min_uptime: '10s', // Minimum uptime before considering stable
    max_restarts: 10, // Maximum restarts before giving up
    
    // Health monitoring
    health_check_grace_period: 3000, // Grace period for health checks
    
    // Graceful shutdown
    listen_timeout: 8000, // Time to wait for connections to close
    shutdown_with_message: true, // Send shutdown message to clients
  }]
}; 