/**
 * Performance Monitoring Utilities
 * Tracks key metrics for production optimization
 */

// Performance metrics storage
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'render' | 'api' | 'navigation' | 'resource';
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Long Task Observer - tracks tasks > 50ms
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addMetric({
            name: 'long-task',
            value: entry.duration,
            timestamp: Date.now(),
            category: 'render',
          });

          if (entry.duration > 100) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.addMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          category: 'render',
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ('processingStart' in entry && 'startTime' in entry) {
            const fid = (entry as any).processingStart - entry.startTime;
            this.addMetric({
              name: 'FID',
              value: fid,
              timestamp: Date.now(),
              category: 'render',
            });
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.addMetric({
          name: 'CLS',
          value: clsValue,
          timestamp: Date.now(),
          category: 'render',
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Performance observers not fully supported:', error);
    }
  }

  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  // Track API call performance
  trackApiCall(endpoint: string, duration: number, success: boolean) {
    this.addMetric({
      name: `api:${endpoint}`,
      value: duration,
      timestamp: Date.now(),
      category: 'api',
    });

    if (duration > 2000) {
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }
  }

  // Track component render time
  trackRender(componentName: string, duration: number) {
    this.addMetric({
      name: `render:${componentName}`,
      value: duration,
      timestamp: Date.now(),
      category: 'render',
    });

    if (duration > 16) { // More than one frame at 60fps
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }

  // Get performance summary
  getSummary() {
    const now = Date.now();
    const last5Minutes = this.metrics.filter(m => now - m.timestamp < 5 * 60 * 1000);

    const apiMetrics = last5Minutes.filter(m => m.category === 'api');
    const renderMetrics = last5Minutes.filter(m => m.category === 'render');

    return {
      totalMetrics: this.metrics.length,
      last5Minutes: last5Minutes.length,
      apiCalls: {
        count: apiMetrics.length,
        avgDuration: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
          : 0,
      },
      renders: {
        count: renderMetrics.length,
        avgDuration: renderMetrics.length > 0 
          ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length 
          : 0,
      },
      coreWebVitals: {
        LCP: this.getLatestMetric('LCP'),
        FID: this.getLatestMetric('FID'),
        CLS: this.getLatestMetric('CLS'),
      },
    };
  }

  private getLatestMetric(name: string): number | null {
    const metric = this.metrics.filter(m => m.name === name).pop();
    return metric?.value ?? null;
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton export
export const performanceMonitor = PerformanceMonitor.getInstance();

// Higher-order function to track API calls
export function withPerformanceTracking<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  const startTime = performance.now();
  
  return apiCall()
    .then((result) => {
      performanceMonitor.trackApiCall(endpoint, performance.now() - startTime, true);
      return result;
    })
    .catch((error) => {
      performanceMonitor.trackApiCall(endpoint, performance.now() - startTime, false);
      throw error;
    });
}

// React hook for component render tracking
export function useRenderTracking(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      performanceMonitor.trackRender(componentName, performance.now() - startTime);
    });
  }
}

// Memory usage tracking
export function getMemoryUsage(): { used: number; total: number } | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    };
  }
  return null;
}
