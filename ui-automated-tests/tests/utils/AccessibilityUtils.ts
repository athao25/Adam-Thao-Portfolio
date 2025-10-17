import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

export interface AccessibilityResults {
  violations: AccessibilityViolation[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
  timestamp: string;
  url: string;
  toolOptions: any;
  testEngine: any;
  testEnvironment: any;
  testRunner: any;
}

export class AccessibilityUtils {
  /**
   * Run accessibility tests using axe-core
   */
  static async runAccessibilityTests(page: Page): Promise<AccessibilityResults> {
    const axe = new AxeBuilder({ page });
    const results = await axe.analyze();
    
    return results as AccessibilityResults;
  }

  /**
   * Run accessibility tests with specific rules
   */
  static async runAccessibilityTestsWithRules(
    page: Page,
    rules: string[] = []
  ): Promise<AccessibilityResults> {
    const axe = new AxeBuilder({ page });
    
    if (rules.length > 0) {
      axe.withTags(rules);
    }
    
    const results = await axe.analyze();
    return results as AccessibilityResults;
  }

  /**
   * Run WCAG 2.1 AA compliance tests
   */
  static async runWCAG21AATests(page: Page): Promise<AccessibilityResults> {
    return this.runAccessibilityTestsWithRules(page, ['wcag2a', 'wcag2aa']);
  }

  /**
   * Run WCAG 2.1 AAA compliance tests
   */
  static async runWCAG21AAATests(page: Page): Promise<AccessibilityResults> {
    return this.runAccessibilityTestsWithRules(page, ['wcag2a', 'wcag2aa', 'wcag2aaa']);
  }

  /**
   * Check for keyboard navigation support
   */
  static async checkKeyboardNavigation(page: Page): Promise<{
    canTabThrough: boolean;
    focusableElements: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Get all focusable elements
    const focusableElements = await page.$$eval(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      (elements) => elements.length
    );

    // Check if elements are properly focusable
    const tabOrder = await page.evaluate(() => {
      const focusable = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(focusable).map((el, index) => ({
        index,
        tagName: el.tagName,
        tabIndex: el.getAttribute('tabindex'),
        visible: el.offsetParent !== null,
      }));
    });

    // Check for missing focus indicators
    const missingFocusIndicators = await page.$$eval(
      'a, button, input, select, textarea',
      (elements) => {
        return elements.filter((el) => {
          const styles = window.getComputedStyle(el);
          return (
            styles.outline === 'none' &&
            styles.boxShadow === 'none' &&
            !styles.border.includes('solid')
          );
        }).length;
      }
    );

    if (missingFocusIndicators > 0) {
      issues.push(`${missingFocusIndicators} elements missing focus indicators`);
    }

    // Check for proper tab order
    const invalidTabOrder = tabOrder.filter((item, index) => {
      if (item.tabIndex && item.tabIndex !== '0') {
        const tabIndex = parseInt(item.tabIndex);
        return tabIndex !== index + 1;
      }
      return false;
    });

    if (invalidTabOrder.length > 0) {
      issues.push('Invalid tab order detected');
    }

    return {
      canTabThrough: issues.length === 0,
      focusableElements,
      issues,
    };
  }

  /**
   * Check for proper ARIA attributes
   */
  static async checkARIAAttributes(page: Page): Promise<{
    missingLabels: number;
    missingRoles: number;
    invalidRoles: number;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check for missing labels on form elements
    const missingLabels = await page.$$eval(
      'input, select, textarea',
      (elements) => {
        return elements.filter((el) => {
          const id = el.getAttribute('id');
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledBy = el.getAttribute('aria-labelledby');
          const label = id ? document.querySelector(`label[for="${id}"]`) : null;
          
          return !ariaLabel && !ariaLabelledBy && !label;
        }).length;
      }
    );

    if (missingLabels > 0) {
      issues.push(`${missingLabels} form elements missing labels`);
    }

    // Check for missing roles on interactive elements
    const missingRoles = await page.$$eval(
      '[role]',
      (elements) => {
        return elements.filter((el) => {
          const role = el.getAttribute('role');
          const validRoles = [
            'button', 'link', 'menuitem', 'tab', 'tabpanel', 'dialog',
            'alert', 'alertdialog', 'status', 'log', 'marquee', 'timer',
            'progressbar', 'slider', 'spinbutton', 'textbox', 'combobox',
            'listbox', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
            'menuitemradio', 'option', 'radio', 'radiogroup', 'checkbox',
            'switch', 'tree', 'treeitem', 'grid', 'gridcell', 'columnheader',
            'rowheader', 'table', 'row', 'cell', 'rowgroup', 'columnheader',
            'rowheader', 'banner', 'complementary', 'contentinfo', 'form',
            'main', 'navigation', 'region', 'search', 'article', 'aside',
            'details', 'figure', 'footer', 'header', 'hgroup', 'mark',
            'section', 'summary', 'time'
          ];
          return role && !validRoles.includes(role);
        }).length;
      }
    );

    if (missingRoles > 0) {
      issues.push(`${missingRoles} elements with invalid ARIA roles`);
    }

    return {
      missingLabels,
      missingRoles,
      invalidRoles: missingRoles,
      issues,
    };
  }

  /**
   * Check color contrast ratios
   */
  static async checkColorContrast(page: Page): Promise<{
    lowContrastElements: number;
    issues: string[];
  }> {
    const issues: string[] = [];

    // This is a simplified check - in a real implementation,
    // you would use a proper color contrast calculation library
    const lowContrastElements = await page.$$eval(
      'p, span, div, h1, h2, h3, h4, h5, h6, a, button',
      (elements) => {
        return elements.filter((el) => {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // This is a placeholder - real implementation would calculate actual contrast ratio
          return color === backgroundColor;
        }).length;
      }
    );

    if (lowContrastElements > 0) {
      issues.push(`${lowContrastElements} elements may have low color contrast`);
    }

    return {
      lowContrastElements,
      issues,
    };
  }

  /**
   * Generate accessibility report
   */
  static generateAccessibilityReport(results: AccessibilityResults): string {
    let report = 'Accessibility Test Report\n';
    report += '========================\n\n';
    report += `URL: ${results.url}\n`;
    report += `Timestamp: ${results.timestamp}\n`;
    report += `Test Engine: ${results.testEngine.name} v${results.testEngine.version}\n\n`;

    report += `Violations: ${results.violations.length}\n`;
    report += `Passes: ${results.passes.length}\n`;
    report += `Incomplete: ${results.incomplete.length}\n`;
    report += `Inapplicable: ${results.inapplicable.length}\n\n`;

    if (results.violations.length > 0) {
      report += 'VIOLATIONS:\n';
      report += '===========\n\n';
      
      results.violations.forEach((violation, index) => {
        report += `${index + 1}. ${violation.description}\n`;
        report += `   Impact: ${violation.impact}\n`;
        report += `   Help: ${violation.help}\n`;
        report += `   Help URL: ${violation.helpUrl}\n`;
        report += `   Affected Elements: ${violation.nodes.length}\n\n`;
      });
    }

    return report;
  }

  /**
   * Validate accessibility results against standards
   */
  static validateAccessibilityResults(results: AccessibilityResults): {
    passed: boolean;
    criticalIssues: number;
    seriousIssues: number;
    moderateIssues: number;
    minorIssues: number;
  } {
    const criticalIssues = results.violations.filter(v => v.impact === 'critical').length;
    const seriousIssues = results.violations.filter(v => v.impact === 'serious').length;
    const moderateIssues = results.violations.filter(v => v.impact === 'moderate').length;
    const minorIssues = results.violations.filter(v => v.impact === 'minor').length;

    const passed = criticalIssues === 0 && seriousIssues === 0;

    return {
      passed,
      criticalIssues,
      seriousIssues,
      moderateIssues,
      minorIssues,
    };
  }
}
