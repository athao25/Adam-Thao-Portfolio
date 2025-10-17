import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly inventoryContainer: Locator;
  readonly productItems: Locator;
  readonly addToCartButtons: Locator;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
    this.productItems = page.locator('.inventory_item');
    this.addToCartButtons = page.locator('[data-test*="add-to-cart"]');
    this.cartIcon = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.sortDropdown = page.locator('[data-test="product_sort_container"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async isInventoryPageLoaded(): Promise<boolean> {
    return await this.inventoryContainer.isVisible();
  }

  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  async addFirstItemToCart(): Promise<void> {
    await this.addToCartButtons.first().click();
  }

  async addItemToCartByIndex(index: number): Promise<void> {
    await this.addToCartButtons.nth(index).click();
  }

  async getCartItemCount(): Promise<string> {
    return await this.cartBadge.textContent() || '0';
  }

  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async sortProducts(sortOption: string): Promise<void> {
    await this.sortDropdown.selectOption(sortOption);
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  async getProductNames(): Promise<string[]> {
    const productNameElements = this.page.locator('.inventory_item_name');
    const count = await productNameElements.count();
    const names: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = await productNameElements.nth(i).textContent();
      if (name) names.push(name);
    }
    
    return names;
  }

  async getProductPrices(): Promise<string[]> {
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