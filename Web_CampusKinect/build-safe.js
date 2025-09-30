#!/usr/bin/env node

// Build script that bypasses Next.js static optimization to prevent hanging
const { spawn } = require('child_process');

console.log('🚀 Starting safe Next.js build...');

// Set environment variables to disable problematic features
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// Run Next.js build with minimal optimization
const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Disable static optimization
    NEXT_PRIVATE_SKIP_STATIC_OPTIMIZATION: '1',
    // Disable image optimization
    NEXT_PRIVATE_DISABLE_IMAGE_OPTIMIZATION: '1',
    // Reduce memory usage
    NODE_OPTIONS: '--max-old-space-size=2048',
  }
});

// Handle build completion
buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
  } else {
    console.error('❌ Build failed with code:', code);
    process.exit(code);
  }
});

// Handle build errors
buildProcess.on('error', (error) => {
  console.error('❌ Build error:', error);
  process.exit(1);
});

// Timeout after 10 minutes
setTimeout(() => {
  console.error('❌ Build timed out after 10 minutes');
  buildProcess.kill('SIGTERM');
  process.exit(1);
}, 10 * 60 * 1000); 