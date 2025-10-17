import { Page, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { TestData } from './TestData';

export class TestHelpers {
  /**
   * Performs a complete login flow with valid credentials
   */
  static async loginWithValidCredentials(page: Page): Promise<InventoryPage> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    return new InventoryPage(page);
  }

  /**
   * Performs a complete login flow with invalid credentials
   */
  static async loginWithInvalidCredentials(page: Page): Promise<LoginPage> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TestData.INVALID_USERNAME, TestData.INVALID_PASSWORD);
    return loginPage;
  }

  /**
   * Adds a specific number of items to cart
   */
  static async addItemsToCart(inventoryPage: InventoryPage, itemCount: number): Promise<void> {
    for (let i = 0; i < itemCount; i++) {
      await inventoryPage.addItemToCartByIndex(i);
    }
  }

  /**
   * Verifies that the cart contains the expected number of items
   */
  static async verifyCartItemCount(page: Page, expectedCount: number): Promise<void> {
    const cartBadge = page.locator('.shopping_cart_badge');
    if (expectedCount > 0) {
      await expect(cartBadge).toHaveText(expectedCount.toString());
    } else {
      await expect(cartBadge).not.toBeVisible();
    }
  }

  /**
   * Waits for page to be fully loaded
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
  }

  /**
   * Takes a screenshot with a descriptive name
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Generates a random string of specified length
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generates random user data for testing
   */
  static generateRandomUserData() {
    return {
      firstName: this.generateRandomString(8),
      lastName: this.generateRandomString(8),
      postalCode: Math.floor(Math.random() * 90000) + 10000
    };
  }

  /**
   * Verifies that products are sorted correctly by name (A to Z)
   */
  static async verifyProductsSortedByName(page: Page): Promise<void> {
    const inventoryPage = new InventoryPage(page);
    const productNames = await inventoryPage.getProductNames();
    
    // Create a copy and sort it to compare
    const sortedNames = [...productNames].sort();
    
    for (let i = 0; i < productNames.length; i++) {
      expect(productNames[i]).toBe(sortedNames[i]);
    }
  }

  /**
   * Verifies that products are sorted correctly by price (low to high)
   */
  static async verifyProductsSortedByPrice(page: Page): Promise<void> {
    const inventoryPage = new InventoryPage(page);
    const productPrices = await inventoryPage.getProductPrices();
    
    // Extract numeric values and sort them
    const numericPrices = productPrices.map(price => parseFloat(price.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    
    for (let i = 0; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBe(sortedPrices[i]);
    }
  }

  /**
   * Waits for element to be visible with timeout
   */
  static async waitForElementVisible(page: Page, selector: string, timeout: number = 10000): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Waits for element to be hidden with timeout
   */
  static async waitForElementHidden(page: Page, selector: string, timeout: number = 10000): Promise<void> {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Clicks element with retry mechanism
   */
  static async clickWithRetry(page: Page, selector: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.click(selector);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fills input with retry mechanism
   */
  static async fillWithRetry(page: Page, selector: string, value: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.fill(selector, value);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Scrolls element into view
   */
  static async scrollIntoView(page: Page, selector: string): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Waits for URL to contain text
   */
  static async waitForUrl(page: Page, url: string | RegExp): Promise<void> {
    await page.waitForURL(url);
  }

  /**
   * Gets text content safely
   */
  static async getTextContent(page: Page, selector: string): Promise<string> {
    return (await page.locator(selector).textContent()) || '';
  }

  /**
   * Checks if element is visible
   */
  static async isElementVisible(page: Page, selector: string): Promise<boolean> {
    try {
      return await page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Checks if element exists
   */
  static async isElementExists(page: Page, selector: string): Promise<boolean> {
    try {
      return await page.locator(selector).count() > 0;
    } catch {
      return false;
    }
  }

  /**
   * Waits for specific text to appear
   */
  static async waitForText(page: Page, text: string, timeout: number = 10000): Promise<void> {
    await page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Clears all cookies and local storage
   */
  static async clearBrowserData(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Sets viewport size
   */
  static async setViewportSize(page: Page, width: number, height: number): Promise<void> {
    await page.setViewportSize({ width, height });
  }

  /**
   * Simulates slow network
   */
  static async simulateSlowNetwork(page: Page, delay: number = 1000): Promise<void> {
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), delay);
    });
  }

  /**
   * Simulates offline network
   */
  static async simulateOfflineNetwork(page: Page): Promise<void> {
    await page.context().setOffline(true);
  }

  /**
   * Restores online network
   */
  static async restoreOnlineNetwork(page: Page): Promise<void> {
    await page.context().setOffline(false);
  }

  /**
   * Generates test data for different scenarios
   */
  static generateTestData(scenario: string): any {
    switch (scenario) {
      case 'valid_user':
        return {
          username: TestData.VALID_USERNAME,
          password: TestData.VALID_PASSWORD,
          firstName: 'John',
          lastName: 'Doe',
          postalCode: '12345'
        };
      case 'invalid_user':
        return {
          username: TestData.INVALID_USERNAME,
          password: TestData.INVALID_PASSWORD,
          firstName: '',
          lastName: '',
          postalCode: ''
        };
      case 'locked_user':
        return {
          username: TestData.LOCKED_USERNAME,
          password: TestData.VALID_PASSWORD,
          firstName: 'Locked',
          lastName: 'User',
          postalCode: '00000'
        };
      default:
        return this.generateRandomUserData();
    }
  }

  /**
   * Validates form data
   */
  static validateFormData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!data.postalCode || data.postalCode.trim() === '') {
      errors.push('Postal code is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Formats test name for reporting
   */
  static formatTestName(testName: string): string {
    return testName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Generates test summary
   */
  static generateTestSummary(results: any[]): string {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const total = results.length;

    return `Test Summary: ${passed}/${total} passed, ${failed} failed`;
  }

  /**
   * Waits for animation to complete
   */
  static async waitForAnimationComplete(page: Page, selector: string): Promise<void> {
    await page.waitForFunction(
      (sel) => {
        const element = document.querySelector(sel);
        if (!element) return true;
        const style = window.getComputedStyle(element);
        return style.animationPlayState === 'paused' || style.animationPlayState === 'finished';
      },
      selector
    );
  }

  /**
   * Handles file upload
   */
  static async handleFileUpload(page: Page, selector: string, filePath: string): Promise<void> {
    await page.setInputFiles(selector, filePath);
  }

  /**
   * Simulates keyboard input
   */
  static async simulateKeyboardInput(page: Page, selector: string, text: string): Promise<void> {
    await page.focus(selector);
    await page.keyboard.type(text);
  }

  /**
   * Simulates mouse hover
   */
  static async simulateMouseHover(page: Page, selector: string): Promise<void> {
    await page.hover(selector);
  }

  /**
   * Simulates drag and drop
   */
  static async simulateDragAndDrop(page: Page, sourceSelector: string, targetSelector: string): Promise<void> {
    await page.dragAndDrop(sourceSelector, targetSelector);
  }

  /**
   * Gets element bounding box
   */
  static async getElementBoundingBox(page: Page, selector: string): Promise<any> {
    return await page.locator(selector).boundingBox();
  }

  /**
   * Checks if element is in viewport
   */
  static async isElementInViewport(page: Page, selector: string): Promise<boolean> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }, selector);
  }
}
