import { Page } from '@playwright/test';

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage?: number;
}

export class PerformanceUtils {
  /**
   * Measure page load performance
   */
  static async measurePageLoad(page: Page): Promise<PerformanceMetrics> {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Will be measured separately
        firstInputDelay: 0, // Will be measured separately
        cumulativeLayoutShift: 0, // Will be measured separately
      };
    });

    return metrics;
  }

  /**
   * Measure Core Web Vitals
   */
  static async measureCoreWebVitals(page: Page): Promise<Partial<PerformanceMetrics>> {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: Partial<PerformanceMetrics> = {};
        
        // Measure LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Measure FID
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            vitals.firstInputDelay = (entry as any).processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ['first-input'] });

        // Measure CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cumulativeLayoutShift = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Resolve after a delay to allow metrics to be collected
        setTimeout(() => resolve(vitals), 3000);
      });
    });
  }

  /**
   * Measure memory usage
   */
  static async measureMemoryUsage(page: Page): Promise<number> {
    return await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
  }

  /**
   * Start performance monitoring
   */
  static async startPerformanceMonitoring(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Enable performance monitoring
      window.performance.mark('test-start');
    });
  }

  /**
   * End performance monitoring and get metrics
   */
  static async endPerformanceMonitoring(page: Page): Promise<PerformanceMetrics> {
    await page.evaluate(() => {
      window.performance.mark('test-end');
      window.performance.measure('test-duration', 'test-start', 'test-end');
    });

    const metrics = await this.measurePageLoad(page);
    const coreVitals = await this.measureCoreWebVitals(page);
    const memoryUsage = await this.measureMemoryUsage(page);

    return {
      ...metrics,
      ...coreVitals,
      memoryUsage,
    };
  }

  /**
   * Check if performance metrics meet thresholds
   */
  static validatePerformanceMetrics(metrics: PerformanceMetrics): {
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const thresholds = {
      loadTime: 3000, // 3 seconds
      firstContentfulPaint: 1500, // 1.5 seconds
      largestContentfulPaint: 2500, // 2.5 seconds
      firstInputDelay: 100, // 100ms
      cumulativeLayoutShift: 0.1, // 0.1
    };

    if (metrics.loadTime > thresholds.loadTime) {
      issues.push(`Load time ${metrics.loadTime}ms exceeds threshold ${thresholds.loadTime}ms`);
    }

    if (metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
      issues.push(`FCP ${metrics.firstContentfulPaint}ms exceeds threshold ${thresholds.firstContentfulPaint}ms`);
    }

    if (metrics.largestContentfulPaint > thresholds.largestContentfulPaint) {
      issues.push(`LCP ${metrics.largestContentfulPaint}ms exceeds threshold ${thresholds.largestContentfulPaint}ms`);
    }

    if (metrics.firstInputDelay > thresholds.firstInputDelay) {
      issues.push(`FID ${metrics.firstInputDelay}ms exceeds threshold ${thresholds.firstInputDelay}ms`);
    }

    if (metrics.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
      issues.push(`CLS ${metrics.cumulativeLayoutShift} exceeds threshold ${thresholds.cumulativeLayoutShift}`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(metrics: PerformanceMetrics): string {
    const validation = this.validatePerformanceMetrics(metrics);
    
    let report = 'Performance Metrics Report\n';
    report += '========================\n\n';
    report += `Load Time: ${metrics.loadTime}ms\n`;
    report += `DOM Content Loaded: ${metrics.domContentLoaded}ms\n`;
    report += `First Contentful Paint: ${metrics.firstContentfulPaint}ms\n`;
    report += `Largest Contentful Paint: ${metrics.largestContentfulPaint}ms\n`;
    report += `First Input Delay: ${metrics.firstInputDelay}ms\n`;
    report += `Cumulative Layout Shift: ${metrics.cumulativeLayoutShift}\n`;
    
    if (metrics.memoryUsage) {
      report += `Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
    }

    report += `\nValidation: ${validation.passed ? 'PASSED' : 'FAILED'}\n`;
    
    if (validation.issues.length > 0) {
      report += '\nIssues:\n';
      validation.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
    }

    return report;
  }
}
