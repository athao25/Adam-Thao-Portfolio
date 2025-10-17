import { test, expect } from '@playwright/test';
import { VisualUtils, VisualTestConfig } from '../../utils/VisualUtils';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { TestData } from '../../utils/TestData';

test.describe('Visual Regression Tests @visual', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    
    // Initialize visual testing directories
    VisualUtils.initializeDirectories();
  });

  test('should match login page baseline', async ({ page }) => {
    await loginPage.goto();
    
    // Compare with baseline
    const result = await VisualUtils.compareWithBaseline(page, 'login-page', {
      threshold: 0.2,
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: true,
    });
    
    expect(result.passed).toBe(true);
    
    if (!result.passed) {
      console.log('Visual diff percentage:', result.diffPercentage);
    }
  });

  test('should match inventory page baseline', async ({ page }) => {
    // Login first
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    
    // Compare with baseline
    const result = await VisualUtils.compareWithBaseline(page, 'inventory-page', {
      threshold: 0.2,
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: true,
    });
    
    expect(result.passed).toBe(true);
  });

  test('should match login form element baseline', async ({ page }) => {
    await loginPage.goto();
    
    // Compare login form element
    const result = await VisualUtils.compareElementWithBaseline(
      page,
      '.login-box',
      'login-form',
      {
        threshold: 0.1,
        maxDiffPixels: 0,
        maxDiffPixelRatio: 0,
        fullPage: false,
      }
    );
    
    expect(result.passed).toBe(true);
  });

  test('should match product cards baseline', async ({ page }) => {
    // Login first
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    
    // Compare product cards
    const productSelectors = [
      '.inventory_item:nth-child(1)',
      '.inventory_item:nth-child(2)',
      '.inventory_item:nth-child(3)',
    ];
    
    const results = await VisualUtils.compareMultipleElements(
      page,
      productSelectors,
      'product-cards',
      {
        threshold: 0.1,
        maxDiffPixels: 0,
        maxDiffPixelRatio: 0,
        fullPage: false,
      }
    );
    
    // All product cards should match
    results.forEach((result, index) => {
      expect(result.passed).toBe(true);
    });
  });

  test('should detect visual changes in header', async ({ page }) => {
    await loginPage.goto();
    
    // Compare header element
    const result = await VisualUtils.compareElementWithBaseline(
      page,
      '.header_secondary_container',
      'header',
      {
        threshold: 0.05, // Very strict threshold for header
        maxDiffPixels: 0,
        maxDiffPixelRatio: 0,
        fullPage: false,
      }
    );
    
    expect(result.passed).toBe(true);
  });

  test('should match mobile viewport baseline', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loginPage.goto();
    
    // Compare mobile login page
    const result = await VisualUtils.compareWithBaseline(page, 'login-page-mobile', {
      threshold: 0.2,
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: true,
    });
    
    expect(result.passed).toBe(true);
  });

  test('should match tablet viewport baseline', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await loginPage.goto();
    
    // Compare tablet login page
    const result = await VisualUtils.compareWithBaseline(page, 'login-page-tablet', {
      threshold: 0.2,
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: true,
    });
    
    expect(result.passed).toBe(true);
  });

  test('should handle dynamic content visual testing', async ({ page }) => {
    await loginPage.goto();
    
    // Test with different user types
    const userTypes = [
      TestData.VALID_USERNAME,
      TestData.PROBLEM_USERNAME,
      TestData.PERFORMANCE_USERNAME,
    ];
    
    for (const username of userTypes) {
      await loginPage.login(username, TestData.VALID_PASSWORD);
      
      // Compare inventory page for each user type
      const result = await VisualUtils.compareWithBaseline(
        page,
        `inventory-page-${username}`,
        {
          threshold: 0.2,
          maxDiffPixels: 0,
          maxDiffPixelRatio: 0,
          fullPage: true,
        }
      );
      
      expect(result.passed).toBe(true);
      
      // Go back to login page for next iteration
      await page.goto('/');
    }
  });

  test('should create baseline screenshots', async ({ page }) => {
    await loginPage.goto();
    
    // Create baseline for login page
    const baselinePath = await VisualUtils.createBaseline(page, 'login-page-baseline', {
      fullPage: true,
    });
    
    expect(baselinePath).toContain('login-page-baseline.png');
    
    // Verify baseline was created
    const fs = require('fs');
    expect(fs.existsSync(baselinePath)).toBe(true);
  });

  test('should generate visual test report', async ({ page }) => {
    await loginPage.goto();
    
    // Run multiple visual tests
    const results = [
      await VisualUtils.compareWithBaseline(page, 'login-page', {
        threshold: 0.2,
        maxDiffPixels: 0,
        maxDiffPixelRatio: 0,
        fullPage: true,
      }),
      await VisualUtils.compareElementWithBaseline(page, '.login-box', 'login-form', {
        threshold: 0.1,
        maxDiffPixels: 0,
        maxDiffPixelRatio: 0,
        fullPage: false,
      }),
    ];
    
    // Generate report
    const report = VisualUtils.generateVisualTestReport(results, 'login-page-tests');
    
    expect(report).toContain('Visual Test Report: login-page-tests');
    expect(report).toContain('Total Tests:');
    expect(report).toContain('Passed:');
    expect(report).toContain('Failed:');
    
    console.log(report);
  });

  test('should handle cross-browser visual consistency', async ({ page, browserName }) => {
    await loginPage.goto();
    
    // Compare across different browsers
    const result = await VisualUtils.compareWithBaseline(
      page,
      `login-page-${browserName}`,
      {
        threshold: 0.3, // Slightly higher threshold for cross-browser differences
        maxDiffPixels: 100, // Allow some pixel differences
        maxDiffPixelRatio: 0.01,
        fullPage: true,
      }
    );
    
    expect(result.passed).toBe(true);
  });

  test('should detect layout shifts', async ({ page }) => {
    await loginPage.goto();
    
    // Test for layout stability
    const result = await VisualUtils.compareWithBaseline(page, 'login-page-layout', {
      threshold: 0.05, // Very strict for layout testing
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: true,
    });
    
    expect(result.passed).toBe(true);
  });
});
