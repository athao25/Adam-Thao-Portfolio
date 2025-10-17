import { Page, expect } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface VisualComparisonResult {
  passed: boolean;
  diffPercentage: number;
  threshold: number;
  diffImagePath?: string;
  error?: string;
}

export interface VisualTestConfig {
  threshold: number;
  maxDiffPixels: number;
  maxDiffPixelRatio: number;
  fullPage: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class VisualUtils {
  private static readonly SCREENSHOTS_DIR = 'reports/screenshots';
  private static readonly VISUAL_DIFFS_DIR = 'reports/visual-diffs';

  /**
   * Initialize visual testing directories
   */
  static initializeDirectories(): void {
    if (!existsSync(this.SCREENSHOTS_DIR)) {
      mkdirSync(this.SCREENSHOTS_DIR, { recursive: true });
    }
    if (!existsSync(this.VISUAL_DIFFS_DIR)) {
      mkdirSync(this.VISUAL_DIFFS_DIR, { recursive: true });
    }
  }

  /**
   * Take a screenshot with timestamp
   */
  static async takeScreenshot(
    page: Page,
    name: string,
    config: Partial<VisualTestConfig> = {}
  ): Promise<string> {
    this.initializeDirectories();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = join(this.SCREENSHOTS_DIR, filename);

    const screenshotConfig = {
      path: filepath,
      fullPage: config.fullPage ?? true,
      ...(config.clip && { clip: config.clip }),
    };

    await page.screenshot(screenshotConfig);
    return filepath;
  }

  /**
   * Compare current page with baseline screenshot
   */
  static async compareWithBaseline(
    page: Page,
    testName: string,
    config: VisualTestConfig = {
      threshold: 0.2,
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: true,
    }
  ): Promise<VisualComparisonResult> {
    this.initializeDirectories();

    const baselinePath = join(this.SCREENSHOTS_DIR, `${testName}-baseline.png`);
    const currentPath = await this.takeScreenshot(page, `${testName}-current`, config);
    const diffPath = join(this.VISUAL_DIFFS_DIR, `${testName}-diff.png`);

    try {
      // Use Playwright's built-in visual comparison
      await expect(page).toHaveScreenshot(`${testName}-baseline.png`, {
        threshold: config.threshold,
        maxDiffPixels: config.maxDiffPixels,
        maxDiffPixelRatio: config.maxDiffPixelRatio,
        fullPage: config.fullPage,
        ...(config.clip && { clip: config.clip }),
      });

      return {
        passed: true,
        diffPercentage: 0,
        threshold: config.threshold,
      };
    } catch (error: any) {
      // If comparison fails, we need to handle the diff
      const diffPercentage = this.calculateDiffPercentage(error);
      
      return {
        passed: false,
        diffPercentage,
        threshold: config.threshold,
        diffImagePath: diffPath,
        error: error.message,
      };
    }
  }

  /**
   * Create a baseline screenshot
   */
  static async createBaseline(
    page: Page,
    testName: string,
    config: Partial<VisualTestConfig> = {}
  ): Promise<string> {
    this.initializeDirectories();
    
    const baselinePath = join(this.SCREENSHOTS_DIR, `${testName}-baseline.png`);
    
    await page.screenshot({
      path: baselinePath,
      fullPage: config.fullPage ?? true,
      ...(config.clip && { clip: config.clip }),
    });

    return baselinePath;
  }

  /**
   * Compare element with baseline
   */
  static async compareElementWithBaseline(
    page: Page,
    selector: string,
    testName: string,
    config: VisualTestConfig = {
      threshold: 0.2,
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: false,
    }
  ): Promise<VisualComparisonResult> {
    this.initializeDirectories();

    const element = page.locator(selector);
    
    try {
      await expect(element).toHaveScreenshot(`${testName}-baseline.png`, {
        threshold: config.threshold,
        maxDiffPixels: config.maxDiffPixels,
        maxDiffPixelRatio: config.maxDiffPixelRatio,
      });

      return {
        passed: true,
        diffPercentage: 0,
        threshold: config.threshold,
      };
    } catch (error: any) {
      const diffPercentage = this.calculateDiffPercentage(error);
      
      return {
        passed: false,
        diffPercentage,
        threshold: config.threshold,
        error: error.message,
      };
    }
  }

  /**
   * Compare multiple elements on a page
   */
  static async compareMultipleElements(
    page: Page,
    selectors: string[],
    testName: string,
    config: VisualTestConfig = {
      threshold: 0.2,
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      fullPage: false,
    }
  ): Promise<VisualComparisonResult[]> {
    const results: VisualComparisonResult[] = [];

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      const elementTestName = `${testName}-element-${i}`;
      
      const result = await this.compareElementWithBaseline(
        page,
        selector,
        elementTestName,
        config
      );
      
      results.push(result);
    }

    return results;
  }

  /**
   * Generate visual test report
   */
  static generateVisualTestReport(
    results: VisualComparisonResult[],
    testName: string
  ): string {
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    let report = `Visual Test Report: ${testName}\n`;
    report += '='.repeat(50) + '\n\n';
    report += `Total Tests: ${total}\n`;
    report += `Passed: ${passed}\n`;
    report += `Failed: ${failed}\n`;
    report += `Success Rate: ${((passed / total) * 100).toFixed(2)}%\n\n`;

    if (failed > 0) {
      report += 'FAILED TESTS:\n';
      report += '-'.repeat(20) + '\n';
      
      results.forEach((result, index) => {
        if (!result.passed) {
          report += `${index + 1}. Diff Percentage: ${result.diffPercentage.toFixed(2)}%\n`;
          report += `   Threshold: ${result.threshold}\n`;
          if (result.diffImagePath) {
            report += `   Diff Image: ${result.diffImagePath}\n`;
          }
          if (result.error) {
            report += `   Error: ${result.error}\n`;
          }
          report += '\n';
        }
      });
    }

    return report;
  }

  /**
   * Calculate diff percentage from error message
   */
  private static calculateDiffPercentage(error: any): number {
    const message = error.message || '';
    const match = message.match(/(\d+(?:\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Clean up old screenshots and diffs
   */
  static cleanupOldFiles(daysToKeep: number = 7): void {
    // This would be implemented to clean up files older than specified days
    // For now, it's a placeholder
    console.log(`Cleaning up files older than ${daysToKeep} days`);
  }

  /**
   * Generate visual regression test summary
   */
  static generateVisualRegressionSummary(
    allResults: { [testName: string]: VisualComparisonResult[] }
  ): string {
    let summary = 'Visual Regression Test Summary\n';
    summary += '='.repeat(40) + '\n\n';

    const testNames = Object.keys(allResults);
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    testNames.forEach(testName => {
      const results = allResults[testName];
      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      
      totalTests += results.length;
      totalPassed += passed;
      totalFailed += failed;

      summary += `${testName}:\n`;
      summary += `  Total: ${results.length}, Passed: ${passed}, Failed: ${failed}\n`;
    });

    summary += '\nOVERALL SUMMARY:\n';
    summary += `Total Tests: ${totalTests}\n`;
    summary += `Passed: ${totalPassed}\n`;
    summary += `Failed: ${totalFailed}\n`;
    summary += `Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%\n`;

    return summary;
  }
}
