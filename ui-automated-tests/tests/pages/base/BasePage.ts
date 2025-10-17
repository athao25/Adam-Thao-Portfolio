import { Page, Locator, expect } from '@playwright/test';

export interface PageInterface {
  goto(): Promise<void>;
  waitForLoad(): Promise<void>;
  isLoaded(): Promise<boolean>;
}

export abstract class BasePage implements PageInterface {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl: string = '') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  abstract goto(): Promise<void>;
  abstract waitForLoad(): Promise<void>;
  abstract isLoaded(): Promise<boolean>;

  /**
   * Wait for element to be visible
   */
  protected async waitForElement(
    locator: Locator,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  protected async waitForElementHidden(
    locator: Locator,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with retry
   */
  protected async clickWithRetry(
    locator: Locator,
    maxRetries: number = 3
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input with retry
   */
  protected async fillWithRetry(
    locator: Locator,
    value: string,
    maxRetries: number = 3
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.fill(value);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Get text content safely
   */
  protected async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  /**
   * Check if element is visible
   */
  protected async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists
   */
  protected async isElementExists(locator: Locator): Promise<boolean> {
    try {
      return await locator.count() > 0;
    } catch {
      return false;
    }
  }

  /**
   * Wait for page to be fully loaded
   */
  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take screenshot
   */
  protected async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `reports/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Scroll element into view
   */
  protected async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for URL to contain text
   */
  protected async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
  }

  /**
   * Get current URL
   */
  protected getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Navigate back
   */
  protected async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Refresh page
   */
  protected async refresh(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Get page title
   */
  protected async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for specific text to appear
   */
  protected async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Assert element is visible
   */
  protected async assertElementVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  protected async assertElementHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /**
   * Assert element contains text
   */
  protected async assertElementText(
    locator: Locator,
    expectedText: string
  ): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Assert element has exact text
   */
  protected async assertElementExactText(
    locator: Locator,
    expectedText: string
  ): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Assert URL contains text
   */
  protected async assertUrlContains(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  /**
   * Assert page title
   */
  protected async assertTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}
