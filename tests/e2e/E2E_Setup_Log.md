# E2E Setup Log

## Tool Choice

For our end-to-end (E2E) testing, we chose **Playwright** because:

- It supports **Chromium browsers**
- Provides **headless and headed modes**, making it flexible for CI/CD pipelines and local testing.
- Comes with a **built-in test runner** and **UI test recorder**.

## Installation Commands

To set up Playwright in the project, run the following commands:

```bash
# Install Playwright Test as a development dependency
npm i -D @playwright/test

# Install required browser binaries
npx playwright install

# Run Playwright test with UI mode
npx playwright test --ui
