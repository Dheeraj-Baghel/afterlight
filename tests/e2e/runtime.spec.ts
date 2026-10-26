import { test, expect } from "@playwright/test";

test("rendering stops offscreen and on document-hidden notification, then resumes", async ({ page }) => {
  await page.setViewportSize({width:1440,height:600});
  await page.addInitScript(()=>{
    const state={draws:0};
    Object.defineProperty(window,"__afterlightDraws",{get:()=>state.draws});
    const prototype=WebGL2RenderingContext.prototype;
    const original=prototype.drawElements;
    prototype.drawElements=function(this:WebGL2RenderingContext,...args:Parameters<typeof original>){state.draws++;return original.apply(this,args);};
  });
  const count=()=>page.evaluate(()=>(window as unknown as {__afterlightDraws:number}).__afterlightDraws);
  await page.goto("/atlas?world=earth");
  await expect(page.locator(".scene-status")).toHaveCount(0);
  await page.locator("canvas").scrollIntoViewIfNeeded();
  await expect.poll(count).toBeGreaterThan(3);
  const active=await count();
  await expect.poll(count).toBeGreaterThan(active+3);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  const offscreen=await count();
  await page.waitForTimeout(400);
  expect(await count()).toBe(offscreen);
  await page.locator("canvas").scrollIntoViewIfNeeded();
  await expect.poll(count).toBeGreaterThan(offscreen+3);
  await page.evaluate(()=>{Object.defineProperty(document,"visibilityState",{value:"hidden",configurable:true});document.dispatchEvent(new Event("visibilitychange"));});
  await page.waitForTimeout(200);
  const hidden=await count();
  await page.waitForTimeout(400);
  expect(await count()).toBe(hidden);
  await page.evaluate(()=>{Object.defineProperty(document,"visibilityState",{value:"visible",configurable:true});document.dispatchEvent(new Event("visibilitychange"));});
  await expect.poll(count).toBeGreaterThan(hidden+3);
});

test("essential home and world content is server rendered with JavaScript disabled", async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto("http://127.0.0.1:4324/");
  await expect(page.getByRole("heading",{level:1})).toContainText("Find your");
  await expect(page.locator(".hero-planet img")).toBeVisible();
  await expect(page.locator(".world-index-item")).toHaveCount(8);
  await page.locator(".world-index-item").filter({hasText:"Mars"}).click();
  await expect(page.getByRole("heading",{level:1})).toContainText("Follow the water.");
  await expect(page.getByRole("heading",{name:"A delta as a time capsule"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Back to the atlas",exact:true})).toHaveAttribute("href","/atlas?world=mars");
  await context.close();
});

test("rapid keyboard search keeps every character and back restores URL-driven filters", async ({ page }) => {
  await page.goto("/missions");
  await page.getByLabel("Search the archive").click();
  await page.keyboard.type("perseverance",{delay:0});
  await expect(page.getByLabel("Search the archive")).toHaveValue("perseverance");
  await expect(page.locator(".mission-card")).toHaveCount(1);
  await page.getByLabel("Destination",{exact:true}).selectOption("mars");
  await page.getByLabel("Mission type").selectOption("rover");
  await page.goBack();
  await expect(page.getByLabel("Mission type")).toHaveValue("all");
  await expect(page.getByLabel("Destination",{exact:true})).toHaveValue("mars");
  await expect(page.getByLabel("Search the archive")).toHaveValue("perseverance");
});

test("comparison teaser changes explanation and real share copy matches the URL", async ({ page, context }) => {
  await page.goto("/");
  await page.getByLabel("Compare Earth with",{exact:true}).selectOption("neptune");
  await expect(page.locator(".teaser-insight")).toContainText("3.86");
  await expect(page.locator(".teaser-insight")).toContainText("Neptune");
  await page.getByRole("link",{name:"Look a little closer",exact:true}).click();
  await expect(page).toHaveURL(/worlds=earth,neptune/);
  await page.getByRole("button",{name:"Share comparison",exact:true}).click();
  const shared=await page.getByLabel("Link to this view").inputValue();
  expect(shared).toBe(page.url());
  await context.grantPermissions(["clipboard-read","clipboard-write"]);
  await page.getByRole("button",{name:"Copy",exact:true}).click();
  await expect(page.getByText("Link copied to your clipboard.")).toBeVisible();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(shared);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button",{name:"Share comparison",exact:true})).toBeFocused();
});

test("request-rendered comparison is meaningful before JavaScript and restores a direct unit URL", async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto("http://127.0.0.1:4324/compare?worlds=earth,mars,neptune&unit=mi");
  await expect(page.locator(".comparison-table")).toContainText("Neptune");
  await expect(page.locator(".comparison-table")).toContainText("mi");
  await expect(page.locator(".comparison-diagram-item")).toHaveCount(3);
  await context.close();
});

test("a pending texture never blocks HTML selection, saving or navigation", async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/textures/saturn.webp", async route => { await gate; await route.continue().catch(() => {}); });
  try {
    const pending = page.waitForRequest("**/textures/saturn.webp");
    await page.goto("/atlas?world=saturn");
    await pending;
    await expect(page.getByText("Loading the selected world. Explore with the controls below.")).toBeVisible();
    await page.getByRole("button",{name:"Select Mars",exact:true}).click();
    await expect(page.locator(".atlas-info h2")).toHaveText("Mars");
    await page.getByRole("button",{name:"Save Mars",exact:true}).click();
    await expect(page.getByRole("button",{name:"Unsave Mars",exact:true})).toHaveAttribute("aria-pressed","true");
    await page.getByRole("link",{name:"Explore Mars",exact:true}).click();
    await expect(page.getByRole("heading",{level:1})).toContainText("Follow the water.");
  } finally { release(); }
});
