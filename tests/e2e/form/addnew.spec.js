import { test, expect } from "@playwright/test";

test.use({
  headless: false,
});

/* --------------------------------------------------
   TEST 1 — ADD NEW REPORT
-------------------------------------------------- */
test("Add new report (TestForm)", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("textbox", { name: "Search place" }).fill("ทุ่งครุ");
  await page.getByRole("button", { name: "Search" }).click();

  await page
    .getByRole("button", { name: "Thung Khru District, Bangkok" })
    .click();

  await page.waitForTimeout(6000);

  await page.getByRole("button", { name: "Report" }).click();
  await page.getByRole("textbox", { name: "Title *" }).fill("TestForm");

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

    await page.getByText("TestForm").waitFor();

    // Dialog listener BEFORE clicking delete
    page.once("dialog", async (dialog) => {
      console.log("Dialog:", dialog.message());
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Delete" }).first().click();

    await page.waitForTimeout(2000);
});