import { Page, Locator } from '@playwright/test';

export class CheckoutOverviewPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async isCheckoutOverviewPageLoaded(): Promise<boolean> {
    return await this.page.locator('#checkout_summary_container').isVisible();
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getSubtotal(): Promise<string> {
    return await this.subtotalLabel.textContent() || '';
  }

  async getTax(): Promise<string> {
    return await this.taxLabel.textContent() || '';
  }

  async getTotal(): Promise<string> {
    return await this.totalLabel.textContent() || '';
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async cancelOrder(): Promise<void> {
    await this.cancelButton.click();
  }

  async getCartItemNames(): Promise<string[]> {
    const itemNameElements = this.page.locator('.inventory_item_name');
    const count = await itemNameElements.count();
    const names: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = await itemNameElements.nth(i).textContent();
      if (name) names.push(name);
    }
    
    return names;
  }

  async getCartItemPrices(): Promise<string[]> {
    const priceElements = this.page.locator('.inventory_item_price');
    const count = await priceElements.count();
    const prices: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const price = await priceElements.nth(i).textContent();
      if (price) prices.push(price);
    }
    
    return prices;
  }
}