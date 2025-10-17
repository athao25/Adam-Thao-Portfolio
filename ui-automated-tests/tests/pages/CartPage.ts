import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;
  readonly cartItemQuantities: Locator;
  readonly removeButtons: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
    this.cartItemQuantities = page.locator('.cart_quantity');
    this.removeButtons = page.locator('[data-test*="remove"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async isCartPageLoaded(): Promise<boolean> {
    return await this.page.locator('#cart_contents_container').isVisible();
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    const count = await this.cartItemNames.count();
    const names: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = await this.cartItemNames.nth(i).textContent();
      if (name) names.push(name);
    }
    
    return names;
  }

  async getCartItemPrices(): Promise<string[]> {
    const count = await this.cartItemPrices.count();
    const prices: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const price = await this.cartItemPrices.nth(i).textContent();
      if (price) prices.push(price);
    }
    
    return prices;
  }

  async removeItemByIndex(index: number): Promise<void> {
    await this.removeButtons.nth(index).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async isEmpty(): Promise<boolean> {
    return await this.cartItems.count() === 0;
  }
}