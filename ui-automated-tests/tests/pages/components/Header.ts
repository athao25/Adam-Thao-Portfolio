import { Page, Locator } from '@playwright/test';
import { ComponentInterface } from '../base/PageInterface';

export class Header implements ComponentInterface {
  private readonly page: Page;
  private readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutButton = page.locator('#logout_sidebar_link');
  }

  async isVisible(): Promise<boolean> {
    return await this.cartBadge.isVisible();
  }

  async waitForVisible(): Promise<void> {
    await this.cartBadge.waitFor({ state: 'visible' });
  }

  async getCartItemCount(): Promise<string> {
    if (await this.cartBadge.isVisible()) {
      return await this.cartBadge.textContent() || '0';
    }
    return '0';
  }

  async isCartEmpty(): Promise<boolean> {
    return !(await this.cartBadge.isVisible());
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutButton.click();
  }

  async goToCart(): Promise<void> {
    await this.cartBadge.click();
  }
}
