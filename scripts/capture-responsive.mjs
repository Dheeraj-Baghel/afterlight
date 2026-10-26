import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser=await chromium.launch({channel:"chrome",headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:"reduce"});
const page=await context.newPage();
await mkdir("artifacts/screenshots",{recursive:true});
try{
  await page.goto("http://127.0.0.1:4324/atlas?world=saturn&group=gas",{waitUntil:"networkidle"});
  await page.locator(".scene-canvas canvas").waitFor();
  await page.locator(".scene-status").waitFor({state:"detached"});
  await page.screenshot({path:"artifacts/screenshots/atlas-mobile.png",fullPage:true});
  await page.goto("http://127.0.0.1:4324/compare?worlds=earth,mars,neptune",{waitUntil:"networkidle"});
  await page.screenshot({path:"artifacts/screenshots/comparison-mobile.png",fullPage:true});
  await page.setViewportSize({width:768,height:1024});
  await page.goto("http://127.0.0.1:4324/",{waitUntil:"networkidle"});
  await page.screenshot({path:"artifacts/screenshots/home-tablet.png",fullPage:true});
  console.log("Captured mobile atlas, mobile comparison and tablet homepage.");
}finally{await browser.close();}
