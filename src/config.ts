// Environment configuration
// Reads from .env.local (dev) or .env.production (prod)
export const config = {
  // Backend API URL
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8787',
  
  // WebSocket URL
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8787',
  
  // Debug mode
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,
  
  // Environment name
  ENV: import.meta.env.MODE || 'development',
};

// Log configuration in development
if (config.DEBUG) {
  console.log('🔧 Config:', config);
}

