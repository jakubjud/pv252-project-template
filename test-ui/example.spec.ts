import { expect } from "@playwright/test";
import { test } from "./coverage_wrapper";

test("check-home-site", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hello World")).toBeInViewport();
  await expect(page.getByAltText("This is watman")).toBeInViewport();

  await page.getByRole("link", { name: "Site A" }).click();
  await expect(page).toHaveURL("/site_a.html");
  await page.goto("/");
  await page.getByRole("link", { name: "Site B" }).click();
  await expect(page).toHaveURL("/site_b.html");
});

test("check-factorial-site", async ({ page }) => {
  await page.goto("/site_a.html");
  await expect(page.getByText("120")).toBeInViewport();
  await expect(page.getByText("5!")).toBeInViewport();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL("/");
});

test("check-fibonacci-site", async ({ page }) => {
  await page.goto("/site_b.html");
  await expect(page.getByText("5")).toBeInViewport();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL("/");
});
