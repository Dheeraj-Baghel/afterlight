import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("artifacts/screenshots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
try {
  console.log("Browser", browser.version());
  await page.goto("http://127.0.0.1:4324/", { waitUntil: "networkidle" });
  await page.screenshot({ path: "artifacts/screenshots/home-desktop-viewport.png" });
  await page.goto("http://127.0.0.1:4324/atlas?world=saturn&group=gas", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  console.log("Atlas", await page.locator(".atlas-info h2").innerText(), "canvas", await page.locator("canvas").count(), "state", await page.locator(".scene-status").allTextContents());
  await page.screenshot({ path: "artifacts/screenshots/atlas-first-pass.png" });
  await page.getByRole("link", { name: "Explore Saturn", exact: true }).click();
  await page.getByRole("button", { name: "Save Saturn", exact: true }).click();
  await page.goto("http://127.0.0.1:4324/expedition");
  await page.getByLabel("Your note for Saturn").fill("What keeps the rings so thin?");
  await page.reload();
  console.log("Persisted", await page.getByLabel("Your note for Saturn").inputValue());
  await page.screenshot({ path: "artifacts/screenshots/expedition-first-pass.png" });
  console.log("Errors", errors);
  await writeFile("artifacts/testing/smoke.json", JSON.stringify({ browser: browser.version(), errors }, null, 2));
} finally { await browser.close(); }