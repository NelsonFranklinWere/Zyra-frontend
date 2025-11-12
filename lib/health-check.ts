/**
 * Health Check Utility
 * Checks connectivity to backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  backend: boolean;
  message: string;
  timestamp: string;
}

/**
 * Check backend health
 */
export const checkBackendHealth = async (): Promise<HealthStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        backend: true,
        message: 'Backend is healthy',
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        status: 'unhealthy',
        backend: false,
        message: `Backend returned status ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      backend: false,
      message: error.message || 'Failed to connect to backend',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check backend readiness (includes database)
 */
export const checkBackendReadiness = async (): Promise<HealthStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health/ready`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        status: data.status === 'ready' ? 'healthy' : 'unhealthy',
        backend: data.status === 'ready',
        message: data.status === 'ready' ? 'Backend is ready' : 'Backend is not ready',
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        status: 'unhealthy',
        backend: false,
        message: `Backend readiness check failed: ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      backend: false,
      message: error.message || 'Failed to check backend readiness',
      timestamp: new Date().toISOString(),
    };
  }
};

