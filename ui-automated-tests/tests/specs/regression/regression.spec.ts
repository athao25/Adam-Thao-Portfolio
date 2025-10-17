import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';

test.describe('Regression Tests @regression', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let checkoutOverviewPage: CheckoutOverviewPage;
  let checkoutCompletePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    checkoutOverviewPage = new CheckoutOverviewPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);
  });

  test.describe('Login Functionality', () => {
    test('should handle all valid user types', async ({ page }) => {
      const validUsers = [
        { username: TestData.VALID_USERNAME, password: TestData.VALID_PASSWORD },
        { username: TestData.PROBLEM_USERNAME, password: TestData.VALID_PASSWORD },
        { username: TestData.PERFORMANCE_USERNAME, password: TestData.VALID_PASSWORD }
      ];

      for (const user of validUsers) {
        await loginPage.goto();
        await loginPage.login(user.username, user.password);
        await expect(inventoryPage.inventoryContainer).toBeVisible();
        await inventoryPage.logout();
      }
    });

    test('should handle all invalid login scenarios', async ({ page }) => {
      const invalidScenarios = [
        { username: TestData.INVALID_USERNAME, password: TestData.INVALID_PASSWORD, expectedError: TestData.ERROR_MESSAGES.INVALID_CREDENTIALS },
        { username: TestData.LOCKED_USERNAME, password: TestData.VALID_PASSWORD, expectedError: TestData.ERROR_MESSAGES.LOCKED_USER },
        { username: '', password: TestData.VALID_PASSWORD, expectedError: TestData.ERROR_MESSAGES.MISSING_USERNAME },
        { username: TestData.VALID_USERNAME, password: '', expectedError: TestData.ERROR_MESSAGES.MISSING_PASSWORD },
        { username: '', password: '', expectedError: TestData.ERROR_MESSAGES.MISSING_USERNAME }
      ];

      for (const scenario of invalidScenarios) {
        await loginPage.goto();
        await loginPage.login(scenario.username, scenario.password);
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(scenario.expectedError);
      }
    });

    test('should handle special characters in credentials', async ({ page }) => {
      const specialCharScenarios = [
        { username: 'user@domain.com', password: 'pass@word' },
        { username: 'user+test', password: 'pass+word' },
        { username: 'user.test', password: 'pass.word' },
        { username: 'user_test', password: 'pass_word' }
      ];

      for (const scenario of specialCharScenarios) {
        await loginPage.goto();
        await loginPage.login(scenario.username, scenario.password);
        // Should show invalid credentials error
        await expect(loginPage.errorMessage).toBeVisible();
      }
    });
  });

  test.describe('Inventory Page Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await TestHelpers.loginWithValidCredentials(page);
    });

    test('should display all products correctly', async ({ page }) => {
      const productCount = await inventoryPage.getProductCount();
      expect(productCount).toBe(6);

      const productNames = await inventoryPage.getProductNames();
      expect(productNames).toEqual(TestData.EXPECTED_PRODUCTS_A_TO_Z);

      const productPrices = await inventoryPage.getProductPrices();
      expect(productPrices).toEqual(TestData.EXPECTED_PRODUCT_PRICES);
    });

    test('should handle all sorting options', async ({ page }) => {
      const sortOptions = [
        TestData.SORT_OPTIONS.NAME_A_TO_Z,
        TestData.SORT_OPTIONS.NAME_Z_TO_A,
        TestData.SORT_OPTIONS.PRICE_LOW_TO_HIGH,
        TestData.SORT_OPTIONS.PRICE_HIGH_TO_LOW
      ];

      for (const sortOption of sortOptions) {
        await inventoryPage.sortProducts(sortOption);
        
        // Verify sorting worked
        const productNames = await inventoryPage.getProductNames();
        expect(productNames.length).toBe(6);
        
        // Verify products are sorted correctly
        if (sortOption === TestData.SORT_OPTIONS.NAME_A_TO_Z) {
          await TestHelpers.verifyProductsSortedByName(page);
        } else if (sortOption === TestData.SORT_OPTIONS.PRICE_LOW_TO_HIGH) {
          await TestHelpers.verifyProductsSortedByPrice(page);
        }
      }
    });

    test('should handle adding all products to cart', async ({ page }) => {
      const productCount = await inventoryPage.getProductCount();
      
      // Add all products to cart
      for (let i = 0; i < productCount; i++) {
        await inventoryPage.addItemToCartByIndex(i);
      }
      
      // Verify cart count
      const cartCount = await inventoryPage.getCartItemCount();
      expect(cartCount).toBe(productCount.toString());
    });

    test('should handle removing items from cart', async ({ page }) => {
      // Add items to cart
      await inventoryPage.addItemToCartByIndex(0);
      await inventoryPage.addItemToCartByIndex(1);
      
      // Go to cart
      await inventoryPage.goToCart();
      
      // Remove first item
      await cartPage.removeItemByIndex(0);
      
      // Verify cart count updated
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);
    });

    test('should handle cart badge visibility', async ({ page }) => {
      // Initially cart should be empty
      const initialCartCount = await inventoryPage.getCartItemCount();
      expect(initialCartCount).toBe('0');
      
      // Add item
      await inventoryPage.addFirstItemToCart();
      const cartCountAfterAdd = await inventoryPage.getCartItemCount();
      expect(cartCountAfterAdd).toBe('1');
      
      // Remove item
      await inventoryPage.goToCart();
      await cartPage.removeItemByIndex(0);
      
      // Go back to inventory
      await cartPage.continueShopping();
      
      // Cart should be empty again
      const finalCartCount = await inventoryPage.getCartItemCount();
      expect(finalCartCount).toBe('0');
    });
  });

  test.describe('Cart Functionality', () => {
    test.beforeEach(async ({ page }) => {
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      await inventoryPage.addItemToCartByIndex(0);
      await inventoryPage.addItemToCartByIndex(1);
      await inventoryPage.goToCart();
    });

    test('should display cart items correctly', async ({ page }) => {
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(2);
      
      const itemNames = await cartPage.getCartItemNames();
      expect(itemNames.length).toBe(2);
      
      const itemPrices = await cartPage.getCartItemPrices();
      expect(itemPrices.length).toBe(2);
    });

    test('should handle removing items from cart', async ({ page }) => {
      // Remove first item
      await cartPage.removeItemByIndex(0);
      
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(1);
      
      // Remove second item
      await cartPage.removeItemByIndex(0);
      
      const finalItemCount = await cartPage.getCartItemCount();
      expect(finalItemCount).toBe(0);
    });

    test('should handle continue shopping', async ({ page }) => {
      await cartPage.continueShopping();
      await expect(inventoryPage.inventoryContainer).toBeVisible();
    });

    test('should handle proceed to checkout', async ({ page }) => {
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(/.*checkout-step-one.html/);
    });
  });

  test.describe('Checkout Functionality', () => {
    test.beforeEach(async ({ page }) => {
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      await inventoryPage.addFirstItemToCart();
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
    });

    test('should handle valid checkout form submission', async ({ page }) => {
      await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
      
      await checkoutPage.continueToOverview();
      await expect(page).toHaveURL(/.*checkout-step-two.html/);
    });

    test('should handle checkout form validation', async ({ page }) => {
      const validationScenarios = [
        { firstName: '', lastName: TestData.TEST_USER_INFO.lastName, postalCode: TestData.TEST_USER_INFO.postalCode, expectedError: TestData.ERROR_MESSAGES.MISSING_FIRST_NAME },
        { firstName: TestData.TEST_USER_INFO.firstName, lastName: '', postalCode: TestData.TEST_USER_INFO.postalCode, expectedError: TestData.ERROR_MESSAGES.MISSING_LAST_NAME },
        { firstName: TestData.TEST_USER_INFO.firstName, lastName: TestData.TEST_USER_INFO.lastName, postalCode: '', expectedError: TestData.ERROR_MESSAGES.MISSING_POSTAL_CODE }
      ];

      for (const scenario of validationScenarios) {
        await checkoutPage.fillCheckoutInfo({ firstName: scenario.firstName, lastName: scenario.lastName, postalCode: scenario.postalCode });
        await checkoutPage.continueToOverview();
        
        await expect(checkoutPage.errorMessage).toBeVisible();
        await expect(checkoutPage.errorMessage).toHaveText(scenario.expectedError);
      }
    });

    test('should handle checkout cancellation', async ({ page }) => {
      await checkoutPage.cancelCheckout();
      await expect(page).toHaveURL(/.*cart.html/);
    });
  });

  test.describe('Checkout Overview Functionality', () => {
    test.beforeEach(async ({ page }) => {
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      await inventoryPage.addFirstItemToCart();
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
      await checkoutPage.continueToOverview();
    });

    test('should display order summary correctly', async ({ page }) => {
      const itemCount = await checkoutOverviewPage.getCartItemCount();
      expect(itemCount).toBe(1);
      
      const itemNames = await checkoutOverviewPage.getCartItemNames();
      expect(itemNames.length).toBe(1);
      
      const subtotal = await checkoutOverviewPage.getSubtotal();
      expect(subtotal).toContain('$');
      
      const tax = await checkoutOverviewPage.getTax();
      expect(tax).toContain('$');
      
      const total = await checkoutOverviewPage.getTotal();
      expect(total).toContain('$');
    });

    test('should handle order completion', async ({ page }) => {
      await checkoutOverviewPage.finishOrder();
      await expect(page).toHaveURL(/.*checkout-complete.html/);
    });

    test('should handle order cancellation', async ({ page }) => {
      await checkoutOverviewPage.cancelOrder();
      await expect(page).toHaveURL(/.*inventory.html/);
    });
  });

  test.describe('Checkout Complete Functionality', () => {
    test.beforeEach(async ({ page }) => {
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      await inventoryPage.addFirstItemToCart();
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
      await checkoutPage.continueToOverview();
      await checkoutOverviewPage.finishOrder();
    });

    test('should display completion message', async ({ page }) => {
      const successMessage = await checkoutCompletePage.getCompleteHeader();
      expect(successMessage).toContain('Thank you for your order!');

      const completeText = await checkoutCompletePage.getCompleteText();
      expect(completeText).toBeTruthy();
    });

    test('should handle back to products navigation', async ({ page }) => {
      await checkoutCompletePage.backToProducts();
      await expect(page).toHaveURL(/.*inventory.html/);
    });
  });

  test.describe('Complete User Journey', () => {
    test('should complete full purchase flow', async ({ page }) => {
      // Login
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      
      // Add items to cart
      await inventoryPage.addItemToCartByIndex(0);
      await inventoryPage.addItemToCartByIndex(1);
      
      // Go to cart
      await inventoryPage.goToCart();
      
      // Proceed to checkout
      await cartPage.proceedToCheckout();
      
      // Fill checkout form
      await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
      
      // Continue to overview
      await checkoutPage.continueToOverview();
      
      // Complete order
      await checkoutOverviewPage.finishOrder();
      
      // Verify completion
      await expect(page).toHaveURL(/.*checkout-complete.html/);
      
      // Back to products
      await checkoutCompletePage.backToProducts();
      await expect(page).toHaveURL(/.*inventory.html/);
    });

    test('should handle multiple purchase cycles', async ({ page }) => {
      // Complete first purchase
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      await inventoryPage.addFirstItemToCart();
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
      await checkoutPage.continueToOverview();
      await checkoutOverviewPage.finishOrder();
      await checkoutCompletePage.backToProducts();
      
      // Complete second purchase
      await inventoryPage.addItemToCartByIndex(1);
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.fillCheckoutInfo(TestData.TEST_USER_INFO);
      await checkoutPage.continueToOverview();
      await checkoutOverviewPage.finishOrder();
      
      // Verify second completion
      await expect(page).toHaveURL(/.*checkout-complete.html/);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network interruptions gracefully', async ({ page }) => {
      // Simulate network issues by intercepting requests
      await page.route('**/*', route => {
        if (Math.random() < 0.1) { // 10% chance of failure
          route.abort();
        } else {
          route.continue();
        }
      });
      
      await loginPage.goto();
      await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
      
      // Should still work despite occasional network issues
      await expect(inventoryPage.inventoryContainer).toBeVisible();
    });

    test('should handle rapid user interactions', async ({ page }) => {
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      
      // Rapidly add and remove items
      for (let i = 0; i < 5; i++) {
        await inventoryPage.addFirstItemToCart();
        await inventoryPage.goToCart();
        await cartPage.removeItemByIndex(0);
        await cartPage.continueShopping();
      }
      
      // Verify final state
      const cartCount = await inventoryPage.getCartItemCount();
      expect(cartCount).toBe('0');
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      const inventoryPage = await TestHelpers.loginWithValidCredentials(page);
      await inventoryPage.addFirstItemToCart();
      await inventoryPage.goToCart();
      
      // Go back
      await page.goBack();
      await expect(inventoryPage.inventoryContainer).toBeVisible();
      
      // Go forward
      await page.goForward();
      await expect(page).toHaveURL(/.*cart.html/);
    });
  });
});
