import fs from "fs";
import { test, expect } from "@playwright/test";

const testData = JSON.parse(fs.readFileSync("./tests/e2e/search/searchData.json", "utf-8"));

test("Search all Bangkok District from JSON", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  for (const place of testData.searches) {
    const searchBox = page.getByRole("textbox", { name: "Search place" });
    const searchButton = page.getByRole("button", { name: "Search" });

    await searchBox.fill(place);
    await searchButton.click();

    // Optional: simple check or short wait
    await expect(searchBox).toHaveValue(place);
    await page.waitForTimeout(1000);
  }
});
