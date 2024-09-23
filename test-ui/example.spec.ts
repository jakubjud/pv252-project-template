import { expect } from "@playwright/test";
import { test } from "./coverage_wrapper";

test("find-watman", async ({ page }) => {  
  await page.goto("/");
  await expect(page.getByAltText("This is watman")).toBeInViewport();
});

test("find-factorial-value", async ({ page }) => {
  await page.goto("/site_a.html");
  await expect(page.getByText("120")).toBeInViewport();
});

test("find-fibonacci-value", async ({ page }) => {
  await page.goto("/site_b.html");
  await expect(page.getByText("5")).toBeInViewport();
});
