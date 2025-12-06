import fs from "fs";
import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { chromium } from "playwright";

if (!process.env.GITHUB_ACTIONS) {
  dotenv.config({ path: ".env.local" });
}

test("Google Sign-In persistent login", async () => {
  const isCI = !!process.env.GITHUB_ACTIONS;
  const userDataDir = "/tmp/chrome-session";

  console.log("Running in CI?", isCI);

  let context;
  let page;

  // -------------------------
  // MODE 1: LOCAL — real Google login
  // -------------------------
  if (!isCI) {
    console.log("Launching persistent headed browser (LOCAL)");

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    page = context.pages()[0] || (await context.newPage());
  }

  // -------------------------
  // MODE 2: CI — mock login
  // -------------------------
  else {
    console.log("Launching headless normal browser (CI MOCK MODE)");

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    context = await browser.newContext();
    page = await context.newPage();

    // ⛔️ DO NOT use real Google login in CI
    console.log("⚠️ Mocking login for CI...");

    await page.goto("http://localhost:3000");
    await page.evaluate(() => {
      localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          currentSession: {
            access_token: "FAKE",
            user: { email: "ci-test@example.com" },
          },
        })
      );
    });
  }

  // -------------------------
  // Load your app
  // -------------------------
  await page.goto("http://localhost:3000");

  // LOCAL: do real login
  if (!isCI) {
    await page.getByRole("button", { name: "Sign in to your account" }).click();

    await page
      .getByRole("textbox", { name: "Email or phone" })
      .fill(process.env.GOOGLE_SIGNIN_EMAIL);

    await page.getByRole("button", { name: "Next" }).click();

    await page
      .getByRole("textbox", { name: "Enter your password" })
      .fill(process.env.GOOGLE_SIGNIN_PASSWORD);

    await page.click("#passwordNext");

    await page.waitForURL("http://localhost:3000/**");
  }
  
  await context.close();
});
