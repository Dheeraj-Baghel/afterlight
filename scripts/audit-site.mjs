import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base="http://127.0.0.1:4324";
const worlds=["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"];
const missions=["mariner-10","messenger","magellan","voyager-2","cassini-huygens","new-horizons","juno","perseverance"];
const routes=["/","/atlas?world=saturn","/atlas?view=list","/compare?worlds=earth,mars,neptune","/missions","/expedition","/about",...worlds.map(id=>`/worlds/${id}`),...missions.map(id=>`/missions/${id}`)];
const browser=await chromium.launch({channel:"chrome",headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:"reduce"});
const page=await context.newPage();
const errors=[],failedRequests=[],routeResults=[],links=new Set();
page.on("pageerror",error=>errors.push({route:page.url(),type:"pageerror",message:error.message}));
page.on("console",message=>{if(message.type()==="error")errors.push({route:page.url(),type:"console",message:message.text()});});
page.on("requestfailed",request=>{if(request.failure()?.errorText!=="net::ERR_ABORTED")failedRequests.push({url:request.url(),error:request.failure()});});
try{
  for(const route of routes){
    const response=await page.goto(base+route,{waitUntil:"networkidle"});
    const anchors=await page.locator("a[href]").evaluateAll(nodes=>nodes.map(node=>node.href));
    for(const href of anchors){const url=new URL(href);if(url.origin===base){url.hash="";links.add(url.href);}}
    const brokenImages=await page.locator("img").evaluateAll(nodes=>nodes.filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.currentSrc));
    const row={route,status:response.status(),title:await page.title(),h1s:await page.locator("h1:visible").count(),brokenImages};
    routeResults.push(row);console.log(row.status,route,"h1",row.h1s);
  }
  const linkResults=[];
  for(const url of links){
    const response=await page.request.get(url);
    linkResults.push({url,status:response.status()});
  }
  const metadata=[];
  for(const path of ["/sitemap.xml","/robots.txt","/manifest.webmanifest","/asset-manifest.json","/icon.svg","/images/social.jpg"]){const response=await page.request.get(base+path);metadata.push({path,status:response.status(),contentType:response.headers()["content-type"]});}
  const report={checkedAt:new Date().toISOString(),browser:browser.version(),mode:"production",routeResults,linkResults,metadata,errors,failedRequests};
  await mkdir("artifacts/testing",{recursive:true});await writeFile("artifacts/testing/site-audit.json",JSON.stringify(report,null,2));
  console.log("SUMMARY",{routes:routeResults.length,links:linkResults.length,errors:errors.length,failedRequests:failedRequests.length,brokenLinks:linkResults.filter(r=>r.status>=400).length});
  if(errors.length||failedRequests.length||routeResults.some(r=>r.status!==200||r.h1s!==1||r.brokenImages.length)||linkResults.some(r=>r.status>=400))process.exitCode=1;
}finally{await browser.close();}
