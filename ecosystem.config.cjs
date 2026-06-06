module.exports = {
  apps: [
    {
      name: 'codesm-backend',
      script: './src/index.ts', // Corrected: relative to cwd
      interpreter: 'node',
      interpreter_args: '--import tsx',
      cwd: './backend',
      instances: 1,           // Run as 1 instance in fork mode to support tsx loader
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'codesm-worker',
      script: './src/worker.js', // Corrected: relative to cwd
      interpreter: 'node',
      interpreter_args: '--import tsx',
      cwd: './workers',
      instances: 1,           // Single instance for worker to avoid file/socket race conditions
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
