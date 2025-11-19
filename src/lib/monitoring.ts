/**
 * Performance Monitoring and Analytics
 * 
 * Tracks Web Vitals, custom metrics, and user experience metrics
 * to identify performance bottlenecks and optimization opportunities.
 */

/**
 * Web Vitals Metrics
 */
export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

/**
 * Custom Performance Metrics
 */
export interface CustomMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
}

/**
 * Performance thresholds based on Web Vitals
 */
export const PERFORMANCE_THRESHOLDS = {
  // Cumulative Layout Shift
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  // First Input Delay
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  // First Contentful Paint
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  // Largest Contentful Paint
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  // Time to First Byte
  TTFB: {
    good: 800,
    needsImprovement: 1800,
  },
  // Interaction to Next Paint
  INP: {
    good: 200,
    needsImprovement: 500,
  },
} as const;

/**
 * Get rating for a metric value
 */
export function getMetricRating(
  name: WebVitalsMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[name];
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Report Web Vitals to console (dev) and analytics (prod)
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  const { name, value, rating } = metric;
  
  // Console logging in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} [Web Vital] ${name}: ${value.toFixed(2)} (${rating})`);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
    
    // Custom analytics endpoint
    sendToAnalytics({
      type: 'web-vital',
      metric: name,
      value,
      rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }
}

/**
 * Track custom performance metrics
 */
export function trackMetric(name: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms') {
  const metric: CustomMetric = {
    name,
    value,
    unit,
    timestamp: Date.now(),
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Metric] ${name}: ${value}${unit}`);
  }
  
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics({
      type: 'custom-metric',
      ...metric,
      url: window.location.href,
    });
  }
  
  return metric;
}

/**
 * Measure and track function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  trackMetric(name, duration, 'ms');
  
  return result;
}

/**
 * Measure async function execution time
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  trackMetric(name, duration, 'ms');
  
  return result;
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        const metrics = {
          'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
          'TCP Connection': perfData.connectEnd - perfData.connectStart,
          'Request Time': perfData.responseStart - perfData.requestStart,
          'Response Time': perfData.responseEnd - perfData.responseStart,
          'DOM Processing': perfData.domComplete - perfData.domInteractive,
          'Page Load': perfData.loadEventEnd - perfData.loadEventStart,
          'Total Time': perfData.loadEventEnd - perfData.fetchStart,
        };
        
        Object.entries(metrics).forEach(([name, value]) => {
          trackMetric(`page-load-${name.toLowerCase().replace(' ', '-')}`, value, 'ms');
        });
      }
    }, 0);
  });
}

/**
 * Track resource loading performance
 */
export function trackResourcePerformance() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Group resources by type
    const resourcesByType: Record<string, number[]> = {};
    
    resources.forEach((resource) => {
      const type = resource.initiatorType;
      const duration = resource.duration;
      
      if (!resourcesByType[type]) {
        resourcesByType[type] = [];
      }
      resourcesByType[type].push(duration);
    });
    
    // Calculate averages and totals
    Object.entries(resourcesByType).forEach(([type, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const total = durations.reduce((a, b) => a + b, 0);
      
      trackMetric(`resource-${type}-avg`, avg, 'ms');
      trackMetric(`resource-${type}-max`, max, 'ms');
      trackMetric(`resource-${type}-total`, total, 'ms');
      trackMetric(`resource-${type}-count`, durations.length, 'count');
    });
  });
}

/**
 * Track API call performance
 */
export function trackAPICall(endpoint: string, duration: number, status: number) {
  trackMetric(`api-${endpoint.replace(/[^a-z0-9]/gi, '-')}`, duration, 'ms');
  
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics({
      type: 'api-call',
      endpoint,
      duration,
      status,
      timestamp: Date.now(),
    });
  }
}

/**
 * Track component render performance
 */
export function trackComponentRender(componentName: string, duration: number) {
  trackMetric(`render-${componentName}`, duration, 'ms');
}

/**
 * Get device information
 */
export function getDeviceInfo() {
  if (typeof navigator === 'undefined') return null;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    connection: {
      effectiveType: (navigator as any).connection?.effectiveType,
      downlink: (navigator as any).connection?.downlink,
      rtt: (navigator as any).connection?.rtt,
      saveData: (navigator as any).connection?.saveData,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio,
    },
  };
}

/**
 * Get memory usage information (Chrome only)
 */
export function getMemoryInfo() {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null;
  }
  
  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

/**
 * Monitor memory usage over time
 */
export function monitorMemory(interval: number = 10000) {
  if (typeof window === 'undefined') return;
  
  setInterval(() => {
    const memoryInfo = getMemoryInfo();
    if (memoryInfo) {
      trackMetric('memory-used-mb', memoryInfo.usedJSHeapSize / 1048576, 'bytes');
      trackMetric('memory-usage-percent', memoryInfo.usedPercentage, 'count');
      
      // Warn if memory usage is high
      if (memoryInfo.usedPercentage > 90) {
        console.warn('High memory usage detected:', memoryInfo);
      }
    }
  }, interval);
}

/**
 * Track navigation timing
 */
export function getNavigationTiming() {
  if (typeof performance === 'undefined') return null;
  
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!perfData) return null;
  
  return {
    // Network
    dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcpConnection: perfData.connectEnd - perfData.connectStart,
    tlsNegotiation: perfData.secureConnectionStart > 0 
      ? perfData.connectEnd - perfData.secureConnectionStart 
      : 0,
    
    // Server
    timeToFirstByte: perfData.responseStart - perfData.requestStart,
    responseTime: perfData.responseEnd - perfData.responseStart,
    
    // Browser
    domProcessing: perfData.domInteractive - perfData.responseEnd,
    domComplete: perfData.domComplete - perfData.domInteractive,
    loadEvent: perfData.loadEventEnd - perfData.loadEventStart,
    
    // Total
    totalTime: perfData.loadEventEnd - perfData.fetchStart,
  };
}

/**
 * Send data to analytics endpoint
 */
async function sendToAnalytics(data: Record<string, any>) {
  try {
    // Use sendBeacon for reliability (even when page is closing)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics', blob);
    } else {
      // Fallback to fetch
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch(() => {
        // Silently fail - don't disrupt user experience
      });
    }
  } catch (error) {
    // Silently fail
  }
}

/**
 * Performance report summary
 */
export function getPerformanceReport() {
  const report: Record<string, any> = {
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    device: getDeviceInfo(),
    memory: getMemoryInfo(),
    navigation: getNavigationTiming(),
  };
  
  // Get all performance entries
  if (typeof performance !== 'undefined') {
    report.marks = performance.getEntriesByType('mark');
    report.measures = performance.getEntriesByType('measure');
    report.resources = performance.getEntriesByType('resource').length;
  }
  
  return report;
}

/**
 * Clear performance data
 */
export function clearPerformanceData() {
  if (typeof performance !== 'undefined') {
    performance.clearMarks();
    performance.clearMeasures();
    performance.clearResourceTimings();
  }
}

/**
 * React Hook: usePerformanceMonitor
 */
import { useEffect } from 'react';

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      trackComponentRender(componentName, duration);
    };
  }, [componentName]);
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Track page load
  trackPageLoad();
  
  // Track resources
  trackResourcePerformance();
  
  // Monitor memory (every 30 seconds)
  monitorMemory(30000);
  
  // Send report before page unload
  window.addEventListener('beforeunload', () => {
    const report = getPerformanceReport();
    sendToAnalytics({
      type: 'performance-report',
      ...report,
    });
  });
  
  console.log('✅ Performance monitoring initialized');
}
