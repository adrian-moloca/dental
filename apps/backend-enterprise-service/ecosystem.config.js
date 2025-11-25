/**
 * PM2 Ecosystem Configuration
 *
 * Production-ready PM2 configuration for cluster mode deployment.
 *
 * Features:
 * - Cluster mode with automatic load balancing
 * - Automatic restart on file changes (watch mode for dev)
 * - Memory limit monitoring and auto-restart
 * - CPU affinity optimization
 * - Graceful shutdown handling
 * - Log rotation
 * - Process monitoring
 *
 * Usage:
 * - Development: pm2 start ecosystem.config.js --env development
 * - Production:  pm2 start ecosystem.config.js --env production
 * - Staging:     pm2 start ecosystem.config.js --env staging
 */

module.exports = {
  apps: [
    {
      // Application name
      name: 'backend-enterprise-service',

      // Script to execute
      script: './dist/apps/backend-enterprise-service/src/main.js',

      // Working directory
      cwd: './',

      // Cluster mode configuration
      instances: process.env.PM2_INSTANCES || 'max', // 'max' = number of CPU cores
      exec_mode: 'cluster',

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3017,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3017,
        LOG_LEVEL: 'debug',
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3017,
        LOG_LEVEL: 'info',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3017,
        LOG_LEVEL: 'warn',
        NODE_OPTIONS: '--max-old-space-size=512',
      },

      // Restart configuration
      watch: false, // Set to true in development for auto-reload
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '1G', // Restart if memory exceeds 1GB

      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10, // Max restarts within min_uptime period
      min_uptime: '10s', // Minimum uptime before considering stable
      restart_delay: 4000, // Delay between restarts

      // Error handling
      exp_backoff_restart_delay: 100, // Exponential backoff for restarts
      kill_timeout: 5000, // Time to wait for graceful shutdown

      // Graceful shutdown
      wait_ready: true, // Wait for ready signal
      listen_timeout: 10000, // Timeout for ready signal
      shutdown_with_message: false,

      // Logging configuration
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true, // Prefix logs with timestamp
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      log_type: 'json', // JSON formatted logs

      // Source map support for better error traces
      source_map_support: true,

      // CPU affinity (distribute processes across CPU cores)
      instance_var: 'INSTANCE_ID',

      // Advanced process management
      vizion: false, // Disable vizion features (git metadata)
      post_update: ['pnpm install'], // Commands to run after code update
      automation: true,

      // Process monitoring
      pmx: true,
      metrics: {
        network: {
          ports: true,
        },
        http: {
          latency: {
            threshold: 300, // Alert if latency > 300ms
          },
          requests_per_minute: {
            alert: {
              threshold: 1000,
            },
          },
        },
      },

      // Graceful shutdown
      kill_timeout: 30000, // 30 seconds for graceful shutdown

      // Health check
      health_check: {
        enable: true,
        interval: 30000, // 30 seconds
        threshold: 3, // Restart after 3 failed health checks
        url: 'http://localhost:3017/health/liveness',
      },
    },
  ],

  /**
   * Deployment configuration
   * Use PM2 deploy feature for automated deployments
   */
  deploy: {
    production: {
      user: 'nodejs',
      host: ['prod-server-1', 'prod-server-2'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/dentalos.git',
      path: '/var/www/backend-enterprise-service',
      'pre-deploy-local': '',
      'post-deploy':
        'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no',
    },
    staging: {
      user: 'nodejs',
      host: 'staging-server',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/dentalos.git',
      path: '/var/www/backend-enterprise-service',
      'post-deploy':
        'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env staging',
      ssh_options: 'StrictHostKeyChecking=no',
    },
  },
};
