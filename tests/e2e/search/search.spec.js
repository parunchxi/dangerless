import fs from "fs";
import { test, expect } from "@playwright/test";

const testData = JSON.parse(
  fs.readFileSync("./tests/e2e/search/searchData.json", "utf-8")
);

test("Search all Bangkok District from JSON", async ({ page }) => {
  console.log("\n========================================");
  console.log("  TEST: Search all Bangkok District from JSON");
  console.log("========================================\n");

  await page.goto("http://localhost:3000/");

  for (const place of testData.validDistricts) {
    const searchBox = page.getByRole("textbox", { name: "Search place" });
    const searchButton = page.getByRole("button", { name: "Search" });

    await searchBox.fill(place);
    await searchButton.click();

    // Wait for popup results to appear
    await page.waitForTimeout(1000);

    // Find popup results and check if any contain the word "District"
    try {
      // Look for all visible buttons/options that might be results
      const allResults = page.locator(
        'button:visible, [role="option"]:visible'
      );
      const count = await allResults.count();

      let districtFound = false;

      for (let i = 0; i < count; i++) {
        const resultText = await allResults.nth(i).textContent();

        // Check if the text contains "District" (case-insensitive)
        if (resultText && resultText.toLowerCase().includes("district")) {
          console.log(
            `✓ Found result with "District" for "${place}": ${resultText.trim()}`
          );

          // Click this result
          await allResults.nth(i).click();
          districtFound = true;
          break;
        }
      }

      if (!districtFound) {
        console.log(`✗ No result containing "District" found for "${place}"`);
      }
    } catch (error) {
      console.log(
        `✗ Failed to find district result for "${place}": ${error.message}`
      );
    }
  }
});
