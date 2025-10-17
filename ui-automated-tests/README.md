# 🧪 UI Test Automation Portfolio

[![CI/CD Pipeline](https://github.com/adamthao/ui-automated-tests/workflows/Test%20Automation%20Pipeline/badge.svg)](https://github.com/adamthao/ui-automated-tests/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg)](https://github.com/adamthao/ui-automated-tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.55-green.svg)](https://playwright.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

A comprehensive, enterprise-grade test automation portfolio demonstrating advanced UI testing against [SauceDemo.com](https://www.saucedemo.com) using TypeScript, Playwright, and industry best practices. This project showcases professional test automation skills including CI/CD integration, visual regression testing, performance monitoring, and accessibility testing.

## 🎯 Portfolio Highlights

- **🏗️ Enterprise Architecture** - Advanced Page Object Model with component-based testing
- **🔧 TypeScript Excellence** - Type-safe development with strict mode and advanced linting
- **🌐 Cross-Platform Testing** - Chrome, Firefox, Safari, and Mobile browsers with responsive design
- **📊 Comprehensive Coverage** - Login, Inventory, Cart, Checkout, Performance, and Accessibility flows
- **🚀 CI/CD Integration** - GitHub Actions with multi-environment testing and automated reporting
- **📈 Advanced Reporting** - Custom HTML reports, analytics, and performance metrics
- **🎨 Visual Testing** - Screenshot comparison and visual regression detection
- **♿ Accessibility Testing** - WCAG compliance and screen reader compatibility
- **⚡ Performance Monitoring** - Page load times, memory usage, and performance regression detection
- **🔒 Security & Quality** - Pre-commit hooks, linting, formatting, and code quality gates

## 📁 Enterprise Project Structure

```
ui-automated-tests/
├── .github/
│   └── workflows/           # CI/CD pipeline configurations
│       ├── test-pipeline.yml
│       ├── visual-regression.yml
│       └── performance-tests.yml
├── tests/
│   ├── pages/               # Advanced Page Object Model
│   │   ├── base/           # Base page classes and interfaces
│   │   │   ├── BasePage.ts
│   │   │   └── PageInterface.ts
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Header.ts
│   │   │   ├── ProductCard.ts
│   │   │   └── CartBadge.ts
│   │   └── pages/          # Page-specific classes
│   │       ├── LoginPage.ts
│   │       ├── InventoryPage.ts
│   │       ├── CartPage.ts
│   │       ├── CheckoutPage.ts
│   │       ├── CheckoutOverviewPage.ts
│   │       └── CheckoutCompletePage.ts
│   ├── specs/              # Test specifications
│   │   ├── smoke/          # Smoke test suites
│   │   ├── regression/     # Regression test suites
│   │   ├── visual/         # Visual regression tests
│   │   ├── performance/    # Performance tests
│   │   ├── accessibility/  # Accessibility tests
│   │   └── e2e/           # End-to-end test suites
│   ├── utils/              # Advanced utilities
│   │   ├── TestData.ts
│   │   ├── TestHelpers.ts
│   │   ├── PerformanceUtils.ts
│   │   ├── AccessibilityUtils.ts
│   │   └── VisualUtils.ts
│   ├── factories/          # Test data factories
│   │   ├── UserFactory.ts
│   │   └── ProductFactory.ts
│   └── fixtures/           # Test fixtures and mock data
├── config/                 # Configuration management
│   ├── environments.ts
│   ├── test-config.ts
│   └── visual-config.ts
├── reports/                # Advanced reporting
│   ├── html/              # Custom HTML reports
│   ├── screenshots/       # Test screenshots
│   ├── videos/            # Test recordings
│   └── performance/       # Performance metrics
├── scripts/               # Automation scripts
│   ├── setup.sh
│   ├── cleanup.sh
│   └── generate-report.js
├── .husky/                # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── playwright.config.ts   # Playwright configuration
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── .commitlintrc.js      # Commit message linting
└── package.json          # Dependencies and scripts
```

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ui-automated-tests
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

## 🧪 Running Tests

### Basic Test Execution
```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui
```

### Browser-Specific Testing
```bash
# Run tests on specific browsers
npm run test:chrome
npm run test:firefox
npm run test:safari
npm run test:mobile
```

### Test Reports
```bash
# View HTML test report
npm run test:report
```

## 📋 Test Coverage

### Login Tests (`login.spec.ts`)
- ✅ Valid credentials login
- ✅ Invalid credentials error handling
- ✅ Locked user error handling
- ✅ Empty field validation
- ✅ Different user types (problem, performance)

### Inventory Tests (`inventory.spec.ts`)
- ✅ Product display verification
- ✅ Add items to cart
- ✅ Product sorting (name A-Z, Z-A, price low-high, high-low)
- ✅ Navigation to cart
- ✅ Logout functionality

### Cart Tests (`cart.spec.ts`)
- ✅ Cart page display
- ✅ Item count verification
- ✅ Item details (names, prices)
- ✅ Remove items functionality
- ✅ Continue shopping
- ✅ Proceed to checkout

### Checkout Tests (`checkout.spec.ts`)
- ✅ Complete checkout flow
- ✅ Form validation (missing fields)
- ✅ Order summary verification
- ✅ Cancel functionality
- ✅ Order completion

## 🏗️ Architecture

### Page Object Model
Each page has its own class containing:
- Element locators
- Page-specific methods
- Business logic encapsulation

### Test Utilities
- `TestData.ts` - Centralized test data and constants
- `TestHelpers.ts` - Reusable helper methods and assertions

### Configuration
- `playwright.config.ts` - Browser configurations, parallel execution, reporting
- `tsconfig.json` - TypeScript compiler options and path mappings

## 🎯 Best Practices Implemented

1. **Page Object Model** - Separates test logic from page structure
2. **TypeScript** - Type safety and better IDE support
3. **Data-Driven Testing** - Centralized test data management
4. **Reusable Components** - Helper methods and utilities
5. **Cross-Browser Testing** - Multiple browser support
6. **Parallel Execution** - Faster test execution
7. **Comprehensive Reporting** - Multiple report formats
8. **Error Handling** - Robust error handling and validation
9. **Maintainable Code** - Clean, readable, and well-documented code

## 📊 Test Execution Examples

```bash
# Run specific test file
npx playwright test tests/specs/login.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should login successfully"

# Run tests in specific browser
npx playwright test --project=chromium

# Generate and view report
npx playwright test --reporter=html
npx playwright show-report
```

## 🔧 Configuration

The project uses Playwright's configuration file (`playwright.config.ts`) with:
- Multiple browser projects (Chrome, Firefox, Safari, Mobile)
- Parallel test execution
- Automatic retries on failure
- Screenshot and video capture on failure
- Multiple report formats (HTML, JSON, JUnit)

## 📈 Reporting

Test results are generated in multiple formats:
- **HTML Report** - Interactive test results with screenshots and videos
- **JSON Report** - Machine-readable test results
- **JUnit Report** - CI/CD integration support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the ISC License.