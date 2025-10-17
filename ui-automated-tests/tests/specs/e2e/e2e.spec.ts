import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../../pages/CheckoutCompletePage';
import { TestData } from '../../utils/TestData';
import { TestHelpers } from '../../utils/TestHelpers';
import { UserFactory } from '../../factories/UserFactory';

test.describe('End-to-End Tests @e2e', () => {
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

  test('should complete full customer journey from login to order completion', async ({ page }) => {
    // Step 1: Login
    await loginPage.goto();
    await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    await expect(inventoryPage.inventoryContainer).toBeVisible();

    // Step 2: Browse products and add to cart
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);

    // Add multiple items to cart
    await inventoryPage.addItemToCartByIndex(0); // Backpack
    await inventoryPage.addItemToCartByIndex(2); // T-Shirt
    await inventoryPage.addItemToCartByIndex(4); // Onesie

    // Verify cart count
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe('3');

    // Step 3: Go to cart and review items
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart.html/);

    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(3);

    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames.length).toBe(3);

    // Step 4: Proceed to checkout
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Step 5: Fill checkout information
    const user = UserFactory.createStandardUser();
    await checkoutPage.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0] // Use email prefix as postal code
    });

    // Step 6: Continue to overview
    await checkoutPage.continueToOverview();
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Step 7: Review order summary
    const orderItemCount = await checkoutOverviewPage.getCartItemCount();
    expect(orderItemCount).toBe(3);

    const subtotal = await checkoutOverviewPage.getSubtotal();
    expect(subtotal).toContain('$');

    const tax = await checkoutOverviewPage.getTax();
    expect(tax).toContain('$');

    const total = await checkoutOverviewPage.getTotal();
    expect(total).toContain('$');

    // Step 8: Complete order
    await checkoutOverviewPage.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // Step 9: Verify order completion
    const successMessage = await checkoutCompletePage.getCompleteHeader();
    expect(successMessage).toContain('Thank you for your order!');

    const completeText = await checkoutCompletePage.getCompleteText();
    expect(completeText).toBeTruthy();

    // Step 10: Return to shopping
    await checkoutCompletePage.backToProducts();
    await expect(page).toHaveURL(/.*inventory.html/);

    // Verify cart is empty after order
    const finalCartCount = await inventoryPage.getCartItemCount();
    expect(finalCartCount).toBe('0');
  });

  test('should handle complete shopping experience with different user types', async ({ page }) => {
    const userTypes = ['standard', 'problem', 'performance'];
    
    for (const userType of userTypes) {
      const user = UserFactory.createUserByType(userType as any);
      
      // Login with different user type
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await expect(inventoryPage.inventoryContainer).toBeVisible();

      // Add items to cart
      await inventoryPage.addFirstItemToCart();
      await inventoryPage.addItemToCartByIndex(1);

      // Complete checkout process
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.fillCheckoutInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        postalCode: user.email.split('@')[0]
      });
      await checkoutPage.continueToOverview();
      await checkoutOverviewPage.finishOrder();

      // Verify completion
      await expect(page).toHaveURL(/.*checkout-complete.html/);

      // Return to products for next iteration
      await checkoutCompletePage.backToProducts();
    }
  });

  test('should handle complete shopping experience with sorting and filtering', async ({ page }) => {
    // Login
    await TestHelpers.loginWithValidCredentials(page);

    // Test different sorting options
    const sortOptions = [
      TestData.SORT_OPTIONS.NAME_A_TO_Z,
      TestData.SORT_OPTIONS.NAME_Z_TO_A,
      TestData.SORT_OPTIONS.PRICE_LOW_TO_HIGH,
      TestData.SORT_OPTIONS.PRICE_HIGH_TO_LOW
    ];

    for (const sortOption of sortOptions) {
      await inventoryPage.sortProducts(sortOption);
      
      // Add first item after sorting
      await inventoryPage.addFirstItemToCart();
      
      // Verify cart count increases
      const cartCount = await inventoryPage.getCartItemCount();
      expect(parseInt(cartCount)).toBeGreaterThan(0);
    }

    // Go to cart and complete purchase
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    const user = UserFactory.createStandardUser();
    await checkoutPage.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0]
    });
    await checkoutPage.continueToOverview();
    await checkoutOverviewPage.finishOrder();

    // Verify completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);
  });

  test('should handle complete shopping experience with cart modifications', async ({ page }) => {
    // Login
    await TestHelpers.loginWithValidCredentials(page);

    // Add multiple items
    await inventoryPage.addItemToCartByIndex(0);
    await inventoryPage.addItemToCartByIndex(1);
    await inventoryPage.addItemToCartByIndex(2);

    // Go to cart
    await inventoryPage.goToCart();

    // Remove one item
    await cartPage.removeItemByIndex(0);
    let itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(2);

    // Add another item
    await cartPage.continueShopping();
    await inventoryPage.addItemToCartByIndex(3);
    await inventoryPage.goToCart();

    // Verify final cart state
    itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(3);

    // Complete purchase
    await cartPage.proceedToCheckout();
    const user = UserFactory.createStandardUser();
    await checkoutPage.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0]
    });
    await checkoutPage.continueToOverview();
    await checkoutOverviewPage.finishOrder();

    // Verify completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);
  });

  test('should handle complete shopping experience with checkout form validation', async ({ page }) => {
    // Login and add items
    await TestHelpers.loginWithValidCredentials(page);
    await inventoryPage.addFirstItemToCart();
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    // Test form validation
    const validationScenarios = [
      { firstName: '', lastName: 'Doe', postalCode: '12345', field: 'First Name' },
      { firstName: 'John', lastName: '', postalCode: '12345', field: 'Last Name' },
      { firstName: 'John', lastName: 'Doe', postalCode: '', field: 'Postal Code' }
    ];

    for (const scenario of validationScenarios) {
      await checkoutPage.fillCheckoutInfo({
        firstName: scenario.firstName,
        lastName: scenario.lastName,
        postalCode: scenario.postalCode
      });
      await checkoutPage.continueToOverview();

      // Should show error
      await expect(checkoutPage.errorMessage).toBeVisible();

      // Clear form for next test
      await checkoutPage.fillCheckoutInfo({
        firstName: '',
        lastName: '',
        postalCode: ''
      });
    }

    // Complete with valid data
    const user = UserFactory.createStandardUser();
    await checkoutPage.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0]
    });
    await checkoutPage.continueToOverview();
    await checkoutOverviewPage.finishOrder();

    // Verify completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);
  });

  test('should handle complete shopping experience with session management', async ({ page }) => {
    // Login
    await TestHelpers.loginWithValidCredentials(page);

    // Add items to cart
    await inventoryPage.addFirstItemToCart();
    await inventoryPage.addItemToCartByIndex(1);

    // Refresh page to test session persistence
    await page.reload();
    await expect(inventoryPage.inventoryContainer).toBeVisible();

    // Verify cart items are still there
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe('2');

    // Complete purchase
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    const user = UserFactory.createStandardUser();
    await checkoutPage.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0]
    });
    await checkoutPage.continueToOverview();
    await checkoutOverviewPage.finishOrder();

    // Verify completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);
  });

  test('should handle complete shopping experience with multiple browser tabs', async ({ page, context }) => {
    // Login in first tab
    await TestHelpers.loginWithValidCredentials(page);

    // Open second tab
    const page2 = await context.newPage();
    const loginPage2 = new LoginPage(page2);
    const inventoryPage2 = new InventoryPage(page2);

    // Login in second tab
    await loginPage2.goto();
    await loginPage2.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
    await expect(inventoryPage2.inventoryContainer).toBeVisible();

    // Add items in both tabs
    await inventoryPage.addFirstItemToCart();
    await inventoryPage2.addItemToCartByIndex(1);

    // Verify cart count in both tabs
    const cartCount1 = await inventoryPage.getCartItemCount();
    const cartCount2 = await inventoryPage2.getCartItemCount();
    expect(cartCount1).toBe('1');
    expect(cartCount2).toBe('1');

    // Complete purchase in first tab
    await inventoryPage.goToCart();
    const cartPage1 = new CartPage(page);
    await cartPage1.proceedToCheckout();
    const checkoutPage1 = new CheckoutPage(page);
    const user = UserFactory.createStandardUser();
    await checkoutPage1.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0]
    });
    await checkoutPage1.continueToOverview();
    const checkoutOverviewPage1 = new CheckoutOverviewPage(page);
    await checkoutOverviewPage1.finishOrder();

    // Verify completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // Close second tab
    await page2.close();
  });

  test('should handle complete shopping experience with error recovery', async ({ page }) => {
    // Login
    await TestHelpers.loginWithValidCredentials(page);

    // Add items to cart
    await inventoryPage.addFirstItemToCart();
    await inventoryPage.goToCart();

    // Simulate network error during checkout
    await page.route('**/checkout-step-one.html', route => {
      if (Math.random() < 0.5) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Try to proceed to checkout (may fail due to network error)
    try {
      await cartPage.proceedToCheckout();
    } catch (error) {
      // If it fails, try again
      await cartPage.proceedToCheckout();
    }

    // Complete checkout
    const user = UserFactory.createStandardUser();
    await checkoutPage.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0]
    });
    await checkoutPage.continueToOverview();
    await checkoutOverviewPage.finishOrder();

    // Verify completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);
  });

  test('should handle complete shopping experience with different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Login
      await loginPage.goto();
      await loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
      await expect(inventoryPage.inventoryContainer).toBeVisible();

      // Add items and complete purchase
      await inventoryPage.addFirstItemToCart();
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      
      const user = UserFactory.createStandardUser();
      await checkoutPage.fillCheckoutInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        postalCode: user.email.split('@')[0]
      });
      await checkoutPage.continueToOverview();
      await checkoutOverviewPage.finishOrder();

      // Verify completion
      await expect(page).toHaveURL(/.*checkout-complete.html/);

      // Return to products for next viewport
      await checkoutCompletePage.backToProducts();
    }
  });

  test('should handle complete shopping experience with performance monitoring', async ({ page }) => {
    // Start performance monitoring
    const startTime = Date.now();

    // Complete full journey
    await TestHelpers.loginWithValidCredentials(page);
    await inventoryPage.addFirstItemToCart();
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    const user = UserFactory.createStandardUser();
    await checkoutPage.fillCheckoutInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: user.email.split('@')[0]
    });
    await checkoutPage.continueToOverview();
    await checkoutOverviewPage.finishOrder();

    // Measure total time
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Verify completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // Verify performance (should complete within 30 seconds)
    expect(totalTime).toBeLessThan(30000);
    console.log(`Complete E2E journey took: ${totalTime}ms`);
  });
});
