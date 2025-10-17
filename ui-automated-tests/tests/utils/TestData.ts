export class TestData {
  // Valid credentials
  static readonly VALID_USERNAME = 'standard_user';
  static readonly VALID_PASSWORD = 'secret_sauce';
  
  // Invalid credentials for negative testing
  static readonly INVALID_USERNAME = 'invalid_user';
  static readonly INVALID_PASSWORD = 'invalid_password';
  static readonly LOCKED_USERNAME = 'locked_out_user';
  static readonly PROBLEM_USERNAME = 'problem_user';
  static readonly PERFORMANCE_USERNAME = 'performance_glitch_user';
  
  // Test user information
  static readonly TEST_USER_INFO = {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345'
  };
  
  // Sort options
  static readonly SORT_OPTIONS = {
    NAME_A_TO_Z: 'az',
    NAME_Z_TO_A: 'za',
    PRICE_LOW_TO_HIGH: 'lohi',
    PRICE_HIGH_TO_LOW: 'hilo'
  };
  
  // Expected product names (in alphabetical order)
  static readonly EXPECTED_PRODUCTS_A_TO_Z = [
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt',
    'Sauce Labs Fleece Jacket',
    'Sauce Labs Onesie',
    'Test.allTheThings() T-Shirt (Red)'
  ];
  
  // Expected product prices
  static readonly EXPECTED_PRODUCT_PRICES = [
    '$29.99',
    '$9.99',
    '$15.99',
    '$49.99',
    '$7.99',
    '$15.99'
  ];
  
  // Error messages
  static readonly ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Epic sadface: Username and password do not match any user in this service',
    LOCKED_USER: 'Epic sadface: Sorry, this user has been locked out.',
    MISSING_USERNAME: 'Epic sadface: Username is required',
    MISSING_PASSWORD: 'Epic sadface: Password is required',
    MISSING_FIRST_NAME: 'Error: First Name is required',
    MISSING_LAST_NAME: 'Error: Last Name is required',
    MISSING_POSTAL_CODE: 'Error: Postal Code is required'
  };

  // Test data for different scenarios
  static readonly TEST_SCENARIOS = {
    VALID_LOGIN: {
      username: 'standard_user',
      password: 'secret_sauce'
    },
    INVALID_LOGIN: {
      username: 'invalid_user',
      password: 'invalid_password'
    },
    LOCKED_USER: {
      username: 'locked_out_user',
      password: 'secret_sauce'
    },
    PROBLEM_USER: {
      username: 'problem_user',
      password: 'secret_sauce'
    },
    PERFORMANCE_USER: {
      username: 'performance_glitch_user',
      password: 'secret_sauce'
    }
  };

  // Checkout test data
  static readonly CHECKOUT_DATA = {
    VALID: {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: '12345'
    },
    INVALID_FIRST_NAME: {
      firstName: '',
      lastName: 'Doe',
      postalCode: '12345'
    },
    INVALID_LAST_NAME: {
      firstName: 'John',
      lastName: '',
      postalCode: '12345'
    },
    INVALID_POSTAL_CODE: {
      firstName: 'John',
      lastName: 'Doe',
      postalCode: ''
    }
  };

  // Performance thresholds
  static readonly PERFORMANCE_THRESHOLDS = {
    PAGE_LOAD_TIME: 3000, // 3 seconds
    FIRST_CONTENTFUL_PAINT: 1500, // 1.5 seconds
    LARGEST_CONTENTFUL_PAINT: 2500, // 2.5 seconds
    FIRST_INPUT_DELAY: 100, // 100ms
    CUMULATIVE_LAYOUT_SHIFT: 0.1 // 0.1
  };

  // Visual testing thresholds
  static readonly VISUAL_THRESHOLDS = {
    DEFAULT: 0.2, // 20% difference allowed
    STRICT: 0.05, // 5% difference allowed
    LOOSE: 0.5 // 50% difference allowed
  };

  // Test timeouts
  static readonly TIMEOUTS = {
    SHORT: 5000, // 5 seconds
    MEDIUM: 10000, // 10 seconds
    LONG: 30000, // 30 seconds
    VERY_LONG: 60000 // 60 seconds
  };

  // Browser configurations
  static readonly BROWSER_CONFIGS = {
    DESKTOP: {
      width: 1920,
      height: 1080
    },
    TABLET: {
      width: 768,
      height: 1024
    },
    MOBILE: {
      width: 375,
      height: 667
    }
  };

  // Test data for data-driven testing
  static readonly DATA_DRIVEN_TESTS = {
    USER_TYPES: [
      'standard_user',
      'problem_user',
      'performance_glitch_user'
    ],
    SORT_OPTIONS: [
      'az',
      'za',
      'lohi',
      'hilo'
    ],
    VIEWPORT_SIZES: [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ]
  };

  // API endpoints (if needed for future API testing)
  static readonly API_ENDPOINTS = {
    LOGIN: '/api/login',
    PRODUCTS: '/api/products',
    CART: '/api/cart',
    CHECKOUT: '/api/checkout'
  };

  // Test environment configurations
  static readonly ENVIRONMENTS = {
    DEVELOPMENT: {
      baseUrl: 'https://www.saucedemo.com',
      timeout: 30000,
      retries: 2
    },
    STAGING: {
      baseUrl: 'https://staging.saucedemo.com',
      timeout: 45000,
      retries: 3
    },
    PRODUCTION: {
      baseUrl: 'https://www.saucedemo.com',
      timeout: 60000,
      retries: 5
    }
  };

  // Test data for accessibility testing
  static readonly ACCESSIBILITY_TESTS = {
    WCAG_LEVELS: ['A', 'AA', 'AAA'],
    KEYBOARD_NAVIGATION_KEYS: ['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
    SCREEN_READER_TESTS: ['NVDA', 'JAWS', 'VoiceOver', 'TalkBack']
  };

  // Test data for visual regression testing
  static readonly VISUAL_TESTS = {
    ELEMENTS_TO_TEST: [
      '.login-box',
      '.inventory_container',
      '.cart_container',
      '.checkout_form',
      '.header_secondary_container'
    ],
    PAGES_TO_TEST: [
      'login-page',
      'inventory-page',
      'cart-page',
      'checkout-page',
      'checkout-overview-page',
      'checkout-complete-page'
    ]
  };

  // Test data for performance testing
  static readonly PERFORMANCE_TESTS = {
    METRICS_TO_MEASURE: [
      'loadTime',
      'domContentLoaded',
      'firstContentfulPaint',
      'largestContentfulPaint',
      'firstInputDelay',
      'cumulativeLayoutShift'
    ],
    PERFORMANCE_BUDGETS: {
      PAGE_LOAD: 3000,
      INTERACTIVE: 2000,
      VISUALLY_COMPLETE: 2500
    }
  };
}
