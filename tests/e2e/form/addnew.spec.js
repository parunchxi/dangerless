import { test, expect } from "@playwright/test";

test.use({
  headless: true,
});

test("Add new report (TestAddForm)", async ({ page }) => {
  console.log("\n========================================");
  console.log("  TEST: Add new report (TestAddForm)");
  console.log("========================================\n");

  await page.goto("http://localhost:3000/");
  await page.getByRole("textbox", { name: "Search place" }).fill("ทุ่งครุ");
  await page.getByRole("button", { name: "Search" }).click();

  await page
    .getByRole("button", { name: "Thung Khru District, Bangkok" })
    .click();

  await page.waitForTimeout(6000);

  await page.getByRole("button", { name: "Report" }).click();
  await page.getByRole("textbox", { name: "Title *" }).fill("TestAddForm");

  await page.getByRole("button", { name: "Select Location From Map" }).click();
  await page.getByRole("region", { name: "Map" }).click({
    position: { x: 786, y: 299 },
  });

  await page.getByText("✓ District match confirmed").waitFor();

  await page.getByRole("textbox", { name: "Date *" }).fill("2025-12-05");
  await page.getByLabel("Category *").selectOption("Natural Hazard");
  await page
    .getByRole("textbox", { name: "Source *" })
    .fill(
      "https://github.com/PunMung-66/dangerless/actions/runs/19957485264/job/57229669008"
    );

  await page.getByRole("textbox", { name: "Description" }).fill("Test");
  await page.getByRole("button", { name: "Submit Report" }).click();

  await page.getByText("Report submitted successfully!").click();

    await page.getByRole("textbox", { name: "Search place" }).fill("ทุ่งครุ");
    await page.getByRole("button", { name: "Search" }).click();

    await page
      .getByRole("button", { name: "Thung Khru District, Bangkok" })
      .click();

    await page.waitForTimeout(6000);
    await page.getByRole("button", { name: "News" }).click();

    await page.getByText("TestAddForm").waitFor();

    // Dialog listener BEFORE clicking delete
    page.once("dialog", async (dialog) => {
      console.log("Dialog:", dialog.message());
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Delete" }).first().click();

    await page.waitForTimeout(2000);
});