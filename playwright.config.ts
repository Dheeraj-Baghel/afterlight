import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "artifacts/testing/playwright-results.json" }], ["html", { outputFolder: "artifacts/testing/playwright-report", open: "never" }]],
  use: { baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:4324", trace: "retain-on-failure", screenshot: "only-on-failure", actionTimeout: 10_000 },
  projects: [{ name: "desktop-chrome", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 1000 } } }],
  webServer: process.env.TEST_BASE_URL ? undefined : { command: "npm run start", url: "http://127.0.0.1:4324", reuseExistingServer: !process.env.CI, timeout: 60_000 }
});