import { test, expect } from '@playwright/test';
import { CheckoutPage, CheckoutInfo } from '../../pages/CheckoutPage';
import { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Checkout Flow Tests', () => {
  test('should complete full checkout flow with valid information', async ({ page }) => {
    // Setup: Login and add items to cart
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 2);
    await inventoryPage.goToCart();
    
    // Step 1: Proceed to checkout
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    // Step 2: Fill checkout information
    const checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.isCheckoutPageLoaded()).resolves.toBe(true);
    
    await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
    await checkoutPage.continueToOverview();
    
    // Step 3: Review order
    const overviewPage = new CheckoutOverviewPage(page);
    await expect(overviewPage.isCheckoutOverviewPageLoaded()).resolves.toBe(true);
    
    const itemCount = await overviewPage.getCartItemCount();
    expect(itemCount).toBe(2);
    
    await overviewPage.finishOrder();
    
    // Step 4: Verify completion
    const completePage = new CheckoutCompletePage(page);
    await expect(completePage.isCheckoutCompletePageLoaded()).resolves.toBe(true);
    await expect(completePage.isOrderSuccessful()).resolves.toBe(true);
    
    const header = await completePage.getCompleteHeader();
    expect(header).toBe('Thank you for your order!');
  });

  test('should display error when first name is missing', async ({ page }) => {
    // Setup: Login and add items to cart
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 1);
    await inventoryPage.goToCart();
    
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    // Test: Missing first name
    const checkoutPage = new CheckoutPage(page);
    const invalidInfo: CheckoutInfo = {
      firstName: '',
      lastName: TestData.TEST_USER_INFO.lastName,
      postalCode: TestData.TEST_USER_INFO.postalCode
    };
    
    await checkoutPage.fillCheckoutInfo(invalidInfo);
    await checkoutPage.continueToOverview();
    
    await expect(checkoutPage.isErrorMessageVisible()).resolves.toBe(true);
    await expect(checkoutPage.getErrorMessage()).resolves.toBe(TestData.ERROR_MESSAGES.MISSING_FIRST_NAME);
  });

  test('should display error when last name is missing', async ({ page }) => {
    // Setup: Login and add items to cart
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 1);
    await inventoryPage.goToCart();
    
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    // Test: Missing last name
    const checkoutPage = new CheckoutPage(page);
    const invalidInfo: CheckoutInfo = {
      firstName: TestData.TEST_USER_INFO.firstName,
      lastName: '',
      postalCode: TestData.TEST_USER_INFO.postalCode
    };
    
    await checkoutPage.fillCheckoutInfo(invalidInfo);
    await checkoutPage.continueToOverview();
    
    await expect(checkoutPage.isErrorMessageVisible()).resolves.toBe(true);
    await expect(checkoutPage.getErrorMessage()).resolves.toBe(TestData.ERROR_MESSAGES.MISSING_LAST_NAME);
  });

  test('should display error when postal code is missing', async ({ page }) => {
    // Setup: Login and add items to cart
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 1);
    await inventoryPage.goToCart();
    
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    // Test: Missing postal code
    const checkoutPage = new CheckoutPage(page);
    const invalidInfo: CheckoutInfo = {
      firstName: TestData.TEST_USER_INFO.firstName,
      lastName: TestData.TEST_USER_INFO.lastName,
      postalCode: ''
    };
    
    await checkoutPage.fillCheckoutInfo(invalidInfo);
    await checkoutPage.continueToOverview();
    
    await expect(checkoutPage.isErrorMessageVisible()).resolves.toBe(true);
    await expect(checkoutPage.getErrorMessage()).resolves.toBe(TestData.ERROR_MESSAGES.MISSING_POSTAL_CODE);
  });

  test('should cancel checkout and return to cart', async ({ page }) => {
    // Setup: Login and add items to cart
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 1);
    await inventoryPage.goToCart();
    
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    // Test: Cancel checkout
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.cancelCheckout();
    
    await expect(page).toHaveURL(/.*cart.html/);
  });

  test('should cancel order from overview page', async ({ page }) => {
    // Setup: Complete checkout flow to overview
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 1);
    await inventoryPage.goToCart();
    
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
    await checkoutPage.continueToOverview();
    
    // Test: Cancel from overview
    const overviewPage = new CheckoutOverviewPage(page);
    await overviewPage.cancelOrder();
    
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should display correct order summary', async ({ page }) => {
    // Setup: Complete checkout flow to overview
    const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
    await TestHelpers.addItemsToCart(inventoryPage, 2);
    await inventoryPage.goToCart();
    
    const cartPage = new (await import('../../pages/CartPage')).CartPage(page);
    await cartPage.proceedToCheckout();
    
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
    await checkoutPage.continueToOverview();
    
    // Test: Verify order summary
    const overviewPage = new CheckoutOverviewPage(page);
    
    const itemCount = await overviewPage.getCartItemCount();
    expect(itemCount).toBe(2);
    
    const subtotal = await overviewPage.getSubtotal();
    const tax = await overviewPage.getTax();
    const total = await overviewPage.getTotal();
    
    expect(subtotal).toMatch(/^Item total: \$\d+\.\d{2}$/);
    expect(tax).toMatch(/^Tax: \$\d+\.\d{2}$/);
    expect(total).toMatch(/^Total: \$\d+\.\d{2}$/);
  });
});