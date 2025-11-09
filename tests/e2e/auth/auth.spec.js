import fs from "fs";
import { test } from "@playwright/test";
import dotenv from "dotenv";
import { chromium } from "playwright";

// Load .env.local only if running locally
if (!process.env.GITHUB_ACTIONS) {
  dotenv.config({ path: ".env.local" });
}

test("Google Sign-In persistent login", async () => {
  const cookiePath = "/tmp/chromium-session"; // use /tmp for GitHub Actions
  console.log("Step 1: Set cookie path:", cookiePath);

  // Remove previous session folder
  if (fs.existsSync(cookiePath)) {
    console.log("Step 2: Removing previous session folder");
    fs.rmSync(cookiePath, { recursive: true, force: true });
  } else {
    console.log("Step 2: No previous session folder found");
  }

  // Launch persistent browser context
  console.log("Step 3: Launching persistent browser context");
  const browser = await chromium.launchPersistentContext(cookiePath, {
    headless: false,
    args: [
      `--disable-blink-features=AutomationControlled`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const page = await browser.newPage();
  console.log("Step 4: Opened new page");

  // Go to your web app
  console.log("Step 5: Navigating to http://localhost:3000/");
  await page.goto("http://localhost:3000/");
  await page.screenshot({ path: "/tmp/after-goto.png" });
  console.log("Step 5: Screenshot taken after page load");

  // Click Google Sign-In button
  console.log('Step 6: Clicking "Sign In with Google" button');
  await page.getByRole("button", { name: "Sign In with Google" }).click();

  // Perform Google login
  console.log("Step 7: Filling email");
  await page
    .getByRole("textbox", { name: "Email or phone" })
    .fill(process.env.GOOGLE_SIGNIN_EMAIL);
  await page.getByRole("button", { name: "Next" }).click();

  console.log("Step 8: Waiting for password input");
  await page
    .getByRole("textbox", { name: "Enter your password" })
    .fill(process.env.GOOGLE_SIGNIN_PASSWORD);
  await page.click("#passwordNext");
  console.log("Step 9: Filling password");

  // Wait for redirect to your app after login
  console.log("Step 10: Waiting for redirect to app");
  await page.waitForURL("http://localhost:3000/**");
  
  const screenshotPath = "/tmp/after-login.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("✅ Step 10.1: Screenshot saved after redirect:", screenshotPath);

  await browser.close();
  console.log("Step 11: Browser closed, test complete");
});
