// Environment configuration
// Reads from .env.local (dev) or .env.production (prod)
export const config = {
  // Backend API URL
  API_URL:
    import.meta.env.VITE_API_URL ||
    'https://quizlink-api.humzab1711.workers.dev',

  // WebSocket URL
  WS_URL:
    import.meta.env.VITE_WS_URL || 'wss://quizlink-api.humzab1711.workers.dev',

  // Debug mode
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || false,

  // Environment name
  ENV: import.meta.env.MODE || 'development',
};

// Log configuration in development
if (config.DEBUG) {
  console.log('🔧 Config:', config);
  console.log('🔧 import.meta.env.MODE:', import.meta.env.MODE);
  console.log('🔧 import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('🔧 import.meta.env.VITE_WS_URL:', import.meta.env.VITE_WS_URL);
}
