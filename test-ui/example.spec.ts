import { expect } from "@playwright/test";
import { test } from "./coverage_wrapper";

test("check-home-site", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hello World")).toBeInViewport();
  await expect(page.getByAltText("This is watman")).toBeInViewport();

  await page.getByText("Factorial value").click();
  await expect(page).toHaveURL("/site_a.html");
  await page.goto("/");
  await page.getByText("5th fibonacci number").click();
  await expect(page).toHaveURL("/site_b.html");
});

test("check-home-menu-links", async ({ page }) => {
  await page.goto("/");
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
});

test("check-fibonacci-site", async ({ page }) => {
  await page.goto("/site_b.html");
  await expect(page.getByText("5")).toBeInViewport();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL("/");
});


// Tests for va2am.cesnet.cz web
const website = "https://va2am.cesnet.cz";
const bogus_input = "bwefijnbEwfeEWFE";

test("va2am-homepage-links", async ({ page }) => {
  await page.goto(website);
  await page.getByRole("link", { name: "RSS" }).click();
  await expect(page).toHaveURL(website + "/feed");

  await page.goBack();
  const image = page.getByAltText("CESNET CERTS Logo");
  await expect(image).toBeVisible();
  // Check if the link opens a new windows with a correct URL.
  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link").filter({ has: image }).click()
  ]);
  await newPage.waitForLoadState("domcontentloaded");
  await expect(newPage).toHaveURL("https://csirt.cesnet.cz/cs/index");
});

test("va2am-homepage-search", async ({ page }) => {
  await page.goto(website);
  // Check if a warning about empty search will be there.
  await page.getByRole("textbox").fill(bogus_input);
  await page.locator("[type=submit]").click();
  await expect(page.getByLabel("Warning:")).toBeVisible();
  await expect(page).toHaveURL(website + "?search=" + bogus_input);

  // Check if a warning about empty search will not be there.
  const input2 = "Medium";
  await page.getByRole("textbox").fill(input2);
  await page.locator("[type=submit]").click();
  await expect(page.getByLabel("Warning:")).not.toBeVisible();
  await expect(page).toHaveURL(website + "?search=" + input2);
});

test("va2am-404-page", async ({ page }) => {
  await page.goto(website + "/" + bogus_input);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByText("Not Found")).toBeVisible();
  await page.getByRole("link").click();
  await expect(page).toHaveURL(website);
});

test("va2am-report-page", async ({ page }) => {
  // Slovak report
  await page.goto(website + "/reports/example");
  await expect(page.getByRole("heading", { name: "[TLP:CLEAR] Juniper" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Odkazy" })).toBeVisible();
  await expect(page.getByLabel("Warning:")).toBeVisible(); // Example report warning
  await expect(page.getByText("Publikoval ")).toBeVisible();
  await expect(page.getByText("Viac informácií").nth(0)).toBeVisible();

  // Czech report
  await page.goto(website + "/reports/example_cz");
  await expect(page.getByLabel("Warning:")).toBeVisible(); // Example report warning
  await expect(page.getByText("Publikovala ")).toBeVisible();
  await expect(page.getByText("Více informací").nth(0)).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(website);
});

test("va2am-report-400", async ({ page }) => {
  // Report ID can only be alphanumerical or '_', '.' is not allowed
  await page.goto(website + "/reports/..reports");
  await expect(page.getByRole("heading", { name: "400" })).toBeVisible();
  await expect(page.getByText("Bad Request")).toBeVisible();
  await page.getByRole("link").click();
  await expect(page).toHaveURL(website);
});
