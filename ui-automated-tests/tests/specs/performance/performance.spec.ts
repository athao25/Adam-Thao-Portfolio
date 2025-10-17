import { test, expect } from '@playwright/test';
import { PerformanceUtils, PerformanceMetrics } from '../../utils/PerformanceUtils';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { TestData } from '../../utils/TestData';

test.describe('Performance Tests @performance', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    
    // Start performance monitoring
    await PerformanceUtils.startPerformanceMonitoring(page);
  });

  test('should meet performance thresholds on login page', async ({ page }) => {
    await loginPage.goto();
    
    // Measure page load performance
    const metrics = await PerformanceUtils.measurePageLoad(page);
    
    // Validate performance metrics
    const validation = PerformanceUtils.validatePerformanceMetrics(metrics);
    
    expect(validation.passed).toBe(true);
    
    if (!validation.passed) {
      console.log('Performance issues:', validation.issues);
    }
  });

  test('should meet performance thresholds on inventory page', async ({ page }) => {
    // Login first
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    
    // Measure inventory page performance
    const metrics = await PerformanceUtils.measurePageLoad(page);
    
    // Validate performance metrics
    const validation = PerformanceUtils.validatePerformanceMetrics(metrics);
    
    expect(validation.passed).toBe(true);
    
    if (!validation.passed) {
      console.log('Performance issues:', validation.issues);
    }
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await loginPage.goto();
    
    // Measure Core Web Vitals
    const coreVitals = await PerformanceUtils.measureCoreWebVitals(page);
    
    // Check LCP (Largest Contentful Paint)
    expect(coreVitals.largestContentfulPaint).toBeLessThan(2500);
    
    // Check CLS (Cumulative Layout Shift)
    expect(coreVitals.cumulativeLayoutShift).toBeLessThan(0.1);
  });

  test('should measure memory usage', async ({ page }) => {
    await loginPage.goto();
    
    // Measure memory usage
    const memoryUsage = await PerformanceUtils.measureMemoryUsage(page);
    
    // Memory usage should be reasonable (less than 100MB)
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024);
  });

  test('should complete full user journey within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    // Complete full user journey
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    
    // Add items to cart
    await inventoryPage.addFirstItemToCart();
    await inventoryPage.goToCart();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Total journey should complete within 10 seconds
    expect(totalTime).toBeLessThan(10000);
  });

  test('should generate performance report', async ({ page }) => {
    await loginPage.goto();
    
    // Get comprehensive performance metrics
    const metrics = await PerformanceUtils.endPerformanceMonitoring(page);
    
    // Generate performance report
    const report = PerformanceUtils.generatePerformanceReport(metrics);
    
    // Report should contain expected sections
    expect(report).toContain('Performance Metrics Report');
    expect(report).toContain('Load Time:');
    expect(report).toContain('First Contentful Paint:');
    expect(report).toContain('Validation:');
    
    console.log(report);
  });

  test('should handle performance regression detection', async ({ page }) => {
    await loginPage.goto();
    
    const metrics = await PerformanceUtils.measurePageLoad(page);
    
    // Simulate performance regression detection
    const baselineMetrics: PerformanceMetrics = {
      loadTime: 1000,
      domContentLoaded: 800,
      firstContentfulPaint: 500,
      largestContentfulPaint: 1200,
      firstInputDelay: 50,
      cumulativeLayoutShift: 0.05,
    };
    
    // Check if current metrics are within acceptable range of baseline
    const loadTimeRegression = metrics.loadTime - baselineMetrics.loadTime;
    const fcpRegression = metrics.firstContentfulPaint - baselineMetrics.firstContentfulPaint;
    
    // Allow for 50% regression tolerance
    expect(loadTimeRegression).toBeLessThan(baselineMetrics.loadTime * 0.5);
    expect(fcpRegression).toBeLessThan(baselineMetrics.firstContentfulPaint * 0.5);
  });
});
