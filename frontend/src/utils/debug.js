// Debug utility for Cursor Clone
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true' || true; // Enable by default

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const debug = {
  // Route debugging
  route: (message, data = null) => {
    if (DEBUG_MODE) {
      console.log(`${colors.cyan}[ROUTE]${colors.reset} ${message}`, data || '');
    }
  },

  // API debugging
  api: (method, url, status, data = null) => {
    if (DEBUG_MODE) {
      const statusColor = status >= 200 && status < 300 ? colors.green : colors.red;
      console.log(`${colors.blue}[API]${colors.reset} ${method} ${url} - ${statusColor}${status}${colors.reset}`, data || '');
    }
  },

  // Store debugging
  store: (storeName, action, data = null) => {
    if (DEBUG_MODE) {
      console.log(`${colors.magenta}[STORE]${colors.reset} ${storeName}:${action}`, data || '');
    }
  },

  // Component debugging
  component: (componentName, lifecycle, data = null) => {
    if (DEBUG_MODE) {
      console.log(`${colors.yellow}[COMPONENT]${colors.reset} ${componentName}:${lifecycle}`, data || '');
    }
  },

  // Socket debugging
  socket: (event, data = null) => {
    if (DEBUG_MODE) {
      console.log(`${colors.green}[SOCKET]${colors.reset} ${event}`, data || '');
    }
  },

  // Performance debugging
  performance: (label, startTime) => {
    if (DEBUG_MODE) {
      const duration = performance.now() - startTime;
      console.log(`${colors.cyan}[PERF]${colors.reset} ${label}: ${duration.toFixed(2)}ms`);
    }
  },

  // Error debugging
  error: (source, error) => {
    if (DEBUG_MODE) {
      console.error(`${colors.red}[ERROR]${colors.reset} ${source}:`, error);
    }
  },

  // Warning debugging
  warn: (source, message) => {
    if (DEBUG_MODE) {
      console.warn(`${colors.yellow}[WARN]${colors.reset} ${source}: ${message}`);
    }
  },

  // Success debugging
  success: (source, message) => {
    if (DEBUG_MODE) {
      console.log(`${colors.green}[SUCCESS]${colors.reset} ${source}: ${message}`);
    }
  },

  // Info debugging
  info: (source, message) => {
    if (DEBUG_MODE) {
      console.log(`${colors.blue}[INFO]${colors.reset} ${source}: ${message}`);
    }
  }
};

// Performance monitor
export const createPerformanceMonitor = (name) => {
  const startTime = performance.now();
  return {
    end: (label = 'Operation') => {
      debug.performance(`${name} - ${label}`, startTime);
    }
  };
};

// API request interceptor for debugging
export const setupApiDebugging = (axiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      debug.api(config.method?.toUpperCase(), config.url, 'REQUEST', {
        headers: config.headers,
        data: config.data
      });
      return config;
    },
    (error) => {
      debug.error('API Request', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      debug.api(response.config.method?.toUpperCase(), response.config.url, response.status, {
        data: response.data
      });
      return response;
    },
    (error) => {
      debug.error('API Response', error);
      return Promise.reject(error);
    }
  );
};

// React component debugging HOC (moved to separate component file if needed)
// Note: This was removed to avoid JSX syntax in .js file
// If you need component debugging, create a separate .jsx utility file

export default debug;
