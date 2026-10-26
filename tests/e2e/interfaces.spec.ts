import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { STORAGE_KEY } from "../../src/lib/expedition";

async function settledScene(page: Page) {
  await expect(page.locator(".scene-canvas canvas")).toBeVisible();
  await expect(page.locator(".scene-status")).toHaveCount(0);
}
async function tabTo(page: Page, target: Locator, max = 60) {
  for(let i=0;i<max;i++) {
    if(await target.evaluate(el=>el===document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Keyboard could not reach ${await target.getAttribute("aria-label") || await target.textContent()}`);
}

test("3D scene loads real textures, rotates, pauses, zooms and switches to a schematic system", async ({ page }) => {
  const errors: string[]=[]; page.on("pageerror",error=>errors.push(error.message));
  await page.goto("/atlas?world=earth");
  await settledScene(page);
  const canvas=page.locator(".scene-canvas canvas");
  await page.getByRole("button",{name:"Pause rotation",exact:true}).click();
  await page.waitForTimeout(450);
  const a=await canvas.screenshot();
  await page.waitForTimeout(450);
  const b=await canvas.screenshot();
  expect(a.equals(b)).toBe(true);
  await page.getByRole("button",{name:"Rotate planet right",exact:true}).click();
  await expect.poll(async () => (await canvas.screenshot()).equals(b)).toBe(false);
  const rotated=await canvas.screenshot();
  expect(rotated.equals(b)).toBe(false);
  await page.getByRole("button",{name:"Zoom in",exact:true}).click();
  await page.waitForTimeout(550);
  expect((await canvas.screenshot()).equals(rotated)).toBe(false);
  await page.getByRole("button",{name:"Reset camera",exact:true}).click();
  await page.getByRole("button",{name:"Resume rotation",exact:true}).click();
  await page.waitForTimeout(250);
  const moving=await canvas.screenshot();
  await page.waitForTimeout(400);
  expect((await canvas.screenshot()).equals(moving)).toBe(false);
  await page.getByLabel("Scene view",{exact:true}).selectOption("system");
  await expect(page).toHaveURL(/scene=system/);
  await expect(page.getByText("Distances, orbit shapes and planet sizes are schematic.",{exact:false})).toBeVisible();
  await page.getByRole("button",{name:"Select Neptune",exact:true}).click();
  await expect(page.locator(".atlas-info h2")).toHaveText("Neptune");
  await page.getByLabel("Scene view",{exact:true}).selectOption("planet");
  await settledScene(page);
  expect(errors).toEqual([]);
});

test("reduced motion is functional and stops automatic scene movement", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/atlas?world=mars");
  await settledScene(page);
  await expect(page.getByRole("button",{name:"Motion reduced",exact:true})).toBeDisabled();
  await expect(page.locator("[data-motion]")).toHaveAttribute("data-motion","reduce");
  const canvas=page.locator(".scene-canvas canvas");
  await page.waitForTimeout(300);
  const a=await canvas.screenshot();
  await page.waitForTimeout(500);
  expect((await canvas.screenshot()).equals(a)).toBe(true);
  await page.getByRole("button",{name:"Rotate planet right"}).click();
  expect((await canvas.screenshot()).equals(a)).toBe(false);
  await page.getByRole("button",{name:"Save Mars",exact:true}).click();
  await expect(page.getByRole("button",{name:"Unsave Mars",exact:true})).toHaveAttribute("aria-pressed","true");
  await page.getByRole("button",{name:"2D list",exact:true}).click();
  await expect(page.locator(".atlas-list-item")).toHaveCount(8);
});

test("in-app motion preference persists and Escape restores dialog focus", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto("/");
  const trigger=page.getByRole("button",{name:"Motion preferences",exact:true});
  await trigger.click();
  await page.getByLabel("Motion preference",{exact:true}).selectOption("reduce");
  await expect(page.getByText(/Reduced motion is active/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.reload();
  await expect(page.locator("[data-motion]")).toHaveAttribute("data-motion","reduce");
  await trigger.click();
  await expect(page.getByLabel("Motion preference",{exact:true})).toHaveValue("reduce");
});

test("unsupported WebGL preserves a useful poster, accessible selection and 2D list", async ({ page }) => {
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype,"getContext",{configurable:true,value:function(this:HTMLCanvasElement,type:string,...args:unknown[]){
      if(type==="webgl"||type==="webgl2"||type==="experimental-webgl") return null;
      return Reflect.apply(original,this,[type,...args]);
    }});
  });
  await page.goto("/atlas?world=saturn");
  await expect(page.getByText(/3D is unavailable on this device/)).toBeVisible();
  await expect(page.locator(".scene-poster img")).toBeVisible();
  await page.getByRole("button",{name:"Select Mars",exact:true}).click();
  await expect(page.locator(".atlas-info h2")).toHaveText("Mars");
  await page.getByRole("button",{name:"Save Mars",exact:true}).click();
  await page.getByRole("button",{name:"2D list",exact:true}).click();
  await expect(page.locator(".atlas-list-item")).toHaveCount(8);
  await page.locator(".atlas-info").getByRole("link",{name:"Explore Mars",exact:true}).click();
  await expect(page.getByRole("heading",{level:1})).toContainText("Follow the water.");
});

test("failed texture and lost graphics context recover without losing selected world", async ({ page }) => {
  await page.route("**/textures/mars.webp",route=>route.abort("failed"));
  await page.goto("/atlas?world=mars");
  await expect(page.getByText(/planet texture could not be loaded/)).toBeVisible();
  await expect(page.locator(".atlas-info h2")).toHaveText("Mars");
  await expect(page.locator(".scene-poster img")).toBeVisible();
  await page.unroute("**/textures/mars.webp");
  await page.getByRole("button",{name:"Retry 3D",exact:true}).click();
  await settledScene(page);
  await page.locator(".scene-canvas canvas").evaluate(el=>{
    const gl=(el as HTMLCanvasElement).getContext("webgl2");
    if(!gl?.getExtension("WEBGL_lose_context")) throw new Error("Test browser does not expose context-loss simulation");
    gl.getExtension("WEBGL_lose_context")!.loseContext();
  });
  await expect(page.getByText(/graphics context was lost/)).toBeVisible();
  await expect(page.locator(".atlas-info h2")).toHaveText("Mars");
  await page.getByRole("button",{name:"Retry 3D",exact:true}).click();
  await settledScene(page);
});

test("invalid queries and missing routes fail usefully instead of crashing", async ({ page }) => {
  await page.goto("/atlas?world=pluto&group=unknown&view=vr&scene=real&q=zzzz");
  await expect(page.locator(".atlas-info h2")).toHaveText("Saturn");
  await expect(page.getByRole("heading",{name:"No worlds in view."})).toBeVisible();
  await page.getByRole("button",{name:"Clear atlas filters"}).click();
  await expect(page.getByRole("group",{name:"Select a planet"}).getByRole("button")).toHaveCount(8);
  await page.goto("/compare?worlds=earth,earth,pluto,mars,neptune,jupiter&unit=nope");
  await expect(page.locator(".compare-slot")).toHaveCount(3);
  await expect(page.getByText(/Unknown or repeated worlds were ignored/)).toBeVisible();
  await expect(page.getByLabel("Radius unit")).toHaveValue("km");
  await page.goto("/missions?type=unknown&destination=pluto&sort=banana");
  await expect(page.locator(".mission-card")).toHaveCount(8);
  for(const path of ["/worlds/pluto","/missions/fake-mission","/this-is-not-a-route"]) {
    const response=await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading",{level:1})).toContainText("An uncharted");
    await expect(page.getByRole("link",{name:"Return home",exact:true})).toBeVisible();
  }
});

test("keyboard-only atlas selection, save, dialog, compare and navigation are operable", async ({ page }) => {
  await page.goto("/atlas?view=list&world=earth");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link",{name:"Skip to content",exact:true})).toBeFocused();
  await page.keyboard.press("Enter");
  const search=page.getByLabel("Search planets");
  await tabTo(page,search);
  await page.keyboard.type("mars");
  await expect(page.locator(".atlas-list-item")).toHaveCount(1);
  const select=page.getByRole("button",{name:"Select Mars",exact:true}).first();
  await tabTo(page,select); await page.keyboard.press("Enter");
  await expect(page.locator(".atlas-info h2")).toHaveText("Mars");
  const save=page.getByRole("button",{name:"Save Mars",exact:true});
  await tabTo(page,save); await page.keyboard.press("Enter");
  await expect(save).not.toBeVisible();
  const compare=page.locator(".atlas-info").getByRole("button",{name:"Compare",exact:true});
  await tabTo(page,compare); await page.keyboard.press("Enter");
  await expect(page.getByRole("link",{name:"Open workspace"})).toBeVisible();
  const share=page.getByRole("button",{name:"Share view",exact:true});
  await tabTo(page,share); await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  for(let i=0;i<8;i++) { await page.keyboard.press("Tab"); expect(await page.getByRole("dialog").evaluate(el=>el.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press("Escape");
  await expect(share).toBeFocused();
});

test("all eight world and mission detail routes render without hydration errors", async ({ page }) => {
  test.setTimeout(90_000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  const worlds=["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"];
  const missions=["mariner-10","messenger","magellan","voyager-2","cassini-huygens","new-horizons","juno","perseverance"];
  for(const path of [...worlds.map(id=>`/worlds/${id}`),...missions.map(id=>`/missions/${id}`),"/about"]){
    const response=await page.goto(path);
    expect(response?.status(),path).toBe(200);
    await expect(page.getByRole("heading",{level:1})).toBeVisible();
    expect(await page.title()).toContain("AFTERLIGHT");
    expect(await page.locator("main").innerText()).not.toContain("undefined");
    await expect(page.locator("main img").first()).toBeVisible().catch(()=>{ if(path!=="/about") throw new Error(`Missing illustration at ${path}`); });
  }
  expect(errors).toEqual([]);
});

test("responsive layouts and dialogs at 360, 390, 768, 1280 and 1536 pixels have no page overflow", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({reducedMotion:"reduce"});
  for(const width of [360,390,768,1280,1536]) {
    await page.setViewportSize({width,height:950});
    for(const path of ["/","/atlas?view=list&world=saturn","/compare?worlds=earth,mars,neptune","/missions","/expedition"]){
      await page.goto(path);
      await page.locator("footer").scrollIntoViewIfNeeded();
      const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
      expect(sizes.scroll,`${path} at ${width}px`).toBeLessThanOrEqual(sizes.width+1);
    }
    await page.goto("/");
    await page.getByRole("button",{name:"Motion preferences",exact:true}).click();
    const box=await page.getByRole("dialog").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x+box!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
  }
});

test("touch scrolling over the atlas remains ordinary page scrolling", async ({ browser }) => {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const page=await context.newPage();
  await page.goto("http://127.0.0.1:4324/atlas?world=saturn");
  await settledScene(page);
  expect(await page.locator("canvas").evaluate(el=>getComputedStyle(el).touchAction)).toBe("pan-y");
  const session=await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:180,y:650}]});
  for(const y of [610,560,510,460,400]) await session.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:180,y}]});
  await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(40);
  await context.close();
});

test("200-percent-equivalent viewport reflow preserves reading, table access and navigation", async ({ page }) => {
  // Real desktop zoom reduces the CSS viewport. 1280 physical px at 200% = 640
  // CSS px. CSS `zoom` does NOT fire media queries and is not a valid proxy.
  // Native Chrome-UI zoom itself remains a manual verification boundary.
  await page.setViewportSize({width:640,height:500});
  for(const path of ["/","/atlas?view=list","/compare?worlds=earth,mars,neptune","/expedition"]){
    await page.goto(path);
    await expect(page.getByRole("heading",{level:1})).toBeVisible();
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
    expect(widths.scroll,`${path} at 200%-equivalent reflow`).toBeLessThanOrEqual(widths.width+1);
    await page.getByRole("button",{name:"Motion preferences",exact:true}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

test("automated accessibility scan of major routes and an open dialog", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({reducedMotion:"reduce"});
  const report: {route:string;violations:unknown[]}[]=[];
  for(const path of ["/","/atlas?view=list&world=saturn","/compare?worlds=earth,mars,neptune","/missions","/missions/cassini-huygens","/worlds/venus","/expedition","/about"]){
    await page.goto(path);
    const result=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
    report.push({route:path,violations:result.violations});
  }
  await page.getByRole("button",{name:"Motion preferences",exact:true}).click();
  const dialog=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
  report.push({route:"preferences dialog",violations:dialog.violations});
  mkdirSync("artifacts/testing",{recursive:true});
  writeFileSync("artifacts/testing/axe-results.json",JSON.stringify(report,null,2));
  expect(report.flatMap(r=>r.violations.map(v=>({route:r.route,violation:v})))).toEqual([]);
});

test("capture representative production screenshots", async ({ page }) => {
  test.setTimeout(90_000);
  mkdirSync("artifacts/screenshots",{recursive:true});
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  await page.screenshot({path:"artifacts/screenshots/home-desktop.png",fullPage:true});
  await page.screenshot({path:"artifacts/screenshots/home-desktop-opening.png"});
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  await page.screenshot({path:"artifacts/screenshots/home-mobile.png",fullPage:true});
  await page.screenshot({path:"artifacts/screenshots/home-mobile-opening.png"});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto("/atlas?world=saturn&group=gas");
  await settledScene(page);
  await page.screenshot({path:"artifacts/screenshots/atlas-saturn.png",fullPage:true});
  await page.goto("/compare?worlds=earth,mars,neptune");
  await page.screenshot({path:"artifacts/screenshots/comparison.png",fullPage:true});
  await page.goto("/missions/cassini-huygens");
  await page.screenshot({path:"artifacts/screenshots/mission-cassini.png",fullPage:true});
  await page.goto("/expedition");
  await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:1,destinations:[{planetId:"saturn",note:"What keeps the rings so thin? Read the Cassini field notes."},{planetId:"mars",note:"Follow the ancient river into Jezero Crater."},{planetId:"neptune",note:"What powers the weather so far from the Sun?"}]})),STORAGE_KEY);
  await page.reload();
  await expect(page.locator(".expedition-item")).toHaveCount(3);
  await page.screenshot({path:"artifacts/screenshots/expedition-notes.png",fullPage:true});
});
