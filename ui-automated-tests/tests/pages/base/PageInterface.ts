import { Page } from '@playwright/test';

export interface PageInterface {
  goto(): Promise<void>;
  waitForLoad(): Promise<void>;
  isLoaded(): Promise<boolean>;
}

export interface ComponentInterface {
  isVisible(): Promise<boolean>;
  waitForVisible(): Promise<void>;
}

export interface TestPageInterface extends PageInterface {
  getTitle(): Promise<string>;
  getUrl(): string;
  takeScreenshot(name: string): Promise<void>;
}

export interface LoginPageInterface extends TestPageInterface {
  login(username: string, password: string): Promise<void>;
  getErrorMessage(): Promise<string>;
  isErrorMessageVisible(): Promise<boolean>;
}

export interface InventoryPageInterface extends TestPageInterface {
  getProductCount(): Promise<number>;
  getProductNames(): Promise<string[]>;
  getProductPrices(): Promise<string[]>;
  addItemToCartByIndex(index: number): Promise<void>;
  addFirstItemToCart(): Promise<void>;
  getCartItemCount(): Promise<string>;
  goToCart(): Promise<void>;
  sortProducts(sortOption: string): Promise<void>;
  logout(): Promise<void>;
}

export interface CartPageInterface extends TestPageInterface {
  getCartItemCount(): Promise<number>;
  getItemNames(): Promise<string[]>;
  getItemPrices(): Promise<string[]>;
  removeItemByIndex(index: number): Promise<void>;
  continueShopping(): Promise<void>;
  proceedToCheckout(): Promise<void>;
}

export interface CheckoutPageInterface extends TestPageInterface {
  fillCheckoutForm(firstName: string, lastName: string, postalCode: string): Promise<void>;
  continueToOverview(): Promise<void>;
  cancelCheckout(): Promise<void>;
  getErrorMessage(): Promise<string>;
  isErrorMessageVisible(): Promise<boolean>;
}

export interface CheckoutOverviewPageInterface extends TestPageInterface {
  getItemCount(): Promise<number>;
  getItemNames(): Promise<string[]>;
  getItemPrices(): Promise<string[]>;
  getSubtotal(): Promise<string>;
  getTax(): Promise<string>;
  getTotal(): Promise<string>;
  finishOrder(): Promise<void>;
  cancelOrder(): Promise<void>;
}

export interface CheckoutCompletePageInterface extends TestPageInterface {
  getSuccessMessage(): Promise<string>;
  getOrderCompleteText(): Promise<string>;
  backToProducts(): Promise<void>;
}
