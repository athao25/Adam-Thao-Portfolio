import { Page, Locator } from '@playwright/test';

export class CheckoutCompletePage {
  readonly page: Page;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly ponyExpressImage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.ponyExpressImage = page.locator('.pony_express');
  }

  async isCheckoutCompletePageLoaded(): Promise<boolean> {
    return await this.page.locator('#checkout_complete_container').isVisible();
  }

  async getCompleteHeader(): Promise<string> {
    return await this.completeHeader.textContent() || '';
  }

  async getCompleteText(): Promise<string> {
    return await this.completeText.textContent() || '';
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }

  async isPonyExpressImageVisible(): Promise<boolean> {
    return await this.ponyExpressImage.isVisible();
  }

  async isOrderSuccessful(): Promise<boolean> {
    const header = await this.getCompleteHeader();
    return header.includes('Thank you for your order!');
  }
}