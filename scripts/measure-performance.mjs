import { chromium } from "@playwright/test";
import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { cpus, totalmem, release, platform } from "node:os";
import { execFileSync } from "node:child_process";

const base="http://127.0.0.1:4324";
const profile={ viewport:{width:390,height:844}, deviceScaleFactor:1, cpuThrottle:4, downloadBytesPerSecond:1_600_000/8, uploadBytesPerSecond:750_000/8, latencyMs:150, observationAfterLoadMs:3500, repeats:3 };
const browser=await chromium.launch({channel:"chrome",headless:true});
const routes=["/","/atlas?world=saturn","/compare?worlds=earth,mars,neptune","/missions/cassini-huygens"];
const results=[];

// Map heavy renderer chunks using actual emitted code, rather than guessing a filename.
const chunks=await readdir(".next/static/chunks");
const rendererChunks=[];
for(const file of chunks.filter(f=>f.endsWith(".js"))){
  const content=await readFile(`.next/static/chunks/${file}`,"utf8");
  if(content.includes("THREE.WebGLRenderer") || content.includes("WebGLRenderer: ") || content.includes("react-three/fiber")) rendererChunks.push(file);
}

try{
  // Warm only the local production server/image optimizer, NOT measured browser caches.
  const warm=await browser.newPage();
  for(const path of routes) await warm.goto(base+path,{waitUntil:"networkidle"});
  await warm.close();
  for(const route of routes){
    for(let run=1;run<=(route==="/"?profile.repeats:1);run++){
      const context=await browser.newContext({viewport:profile.viewport,deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:"no-preference"});
      const page=await context.newPage();
      const cdp=await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
      await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:profile.latencyMs,downloadThroughput:profile.downloadBytesPerSecond,uploadThroughput:profile.uploadBytesPerSecond,connectionType:"cellular4g"});
      await cdp.send("Emulation.setCPUThrottlingRate",{rate:profile.cpuThrottle});
      const errors=[];
      page.on("pageerror",error=>errors.push(error.message));
      await page.addInitScript(()=>{
        const state={lcpMs:0,lcpElement:"",cls:0,longTasks:[],eventDurations:[]};
        window.__afterlightPerf=state;
        new PerformanceObserver(list=>{for(const e of list.getEntries()){state.lcpMs=e.startTime;state.lcpElement=e.element?.tagName+"."+e.element?.className;}}).observe({type:"largest-contentful-paint",buffered:true});
        new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)state.cls+=e.value;}).observe({type:"layout-shift",buffered:true});
        new PerformanceObserver(list=>{for(const e of list.getEntries())state.longTasks.push(e.duration);}).observe({type:"longtask",buffered:true});
        if(PerformanceObserver.supportedEntryTypes.includes("event"))new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.interactionId)state.eventDurations.push(e.duration);}).observe({type:"event",durationThreshold:16,buffered:true});
      });
      const response=await page.goto(base+route,{waitUntil:"load",timeout:60_000});
      await page.waitForTimeout(profile.observationAfterLoadMs);
      const metrics=await page.evaluate(()=>({
        ...window.__afterlightPerf,
        resources:performance.getEntriesByType("resource").map(e=>({name:e.name,type:e.initiatorType,transferBytes:e.transferSize,encodedBytes:e.encodedBodySize,durationMs:e.duration})),
        navigation:performance.getEntriesByType("navigation").map(e=>({ttfbMs:e.responseStart,domContentLoadedMs:e.domContentLoadedEventEnd,loadMs:e.loadEventEnd}))[0],
        viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
        fonts:document.fonts.status
      }));
      let interaction=null;
      if(route.startsWith("/atlas")){
        const start=performance.now();
        await page.getByRole("button",{name:"Select Mars",exact:true}).click();
        await page.getByRole("heading",{name:"Mars",exact:true}).waitFor();
        interaction={automationClickToVisibleHeadingMs:performance.now()-start,note:"Includes Playwright transport and actionability overhead, not field INP."};
      }
      // Preloaded assets have initiatorType="link", not "img"/"script".
      // Include them by URL so transfer totals do not omit eager/LCP resources.
      const scripts=metrics.resources.filter(r=>r.type==="script" || /\.m?js(?:\?|$)/.test(r.name));
      const images=metrics.resources.filter(r=>r.type==="img" || r.name.includes("/_next/image?") || /\.(png|jpe?g|webp|avif|svg)(?:\?|$)/i.test(r.name));
      const heavyRequests=scripts.filter(r=>rendererChunks.some(f=>r.name.endsWith("/"+f))).map(r=>r.name);
      const result={route,run,http:response.status(),...metrics,totals:{scriptTransferBytes:scripts.reduce((sum,r)=>sum+r.transferBytes,0),imageTransferBytes:images.reduce((sum,r)=>sum+r.transferBytes,0),allResourceTransferBytes:metrics.resources.reduce((sum,r)=>sum+r.transferBytes,0)},rendererChunksRequested:heavyRequests,interaction,errors};
      results.push(result);
      console.log(JSON.stringify({route,run,lcpMs:result.lcpMs,cls:result.cls,scriptKiB:Math.round(result.totals.scriptTransferBytes/1024),imageKiB:Math.round(result.totals.imageTransferBytes/1024),rendererRequests:heavyRequests.length,errors}));
      await context.close();
    }
  }
  let osVersion="";try{osVersion=execFileSync("sw_vers",["-productVersion"],{encoding:"utf8"}).trim();}catch{}
  const report={measuredAt:new Date().toISOString(),mode:"Next.js production local server, warm server/image optimizer, cold independent browser contexts, CDP cache disabled",browser:browser.version(),hardware:{cpu:cpus()[0]?.model,logicalCpus:cpus().length,totalMemoryBytes:totalmem(),platform:platform(),kernel:release(),osVersion},profile,rendererChunks,results,fieldINP:null,limitations:["Laboratory observations on this Mac, not a mobile handset or field metric.","CDP simulates bandwidth/latency and CPU but not mobile GPU behavior.","A local origin and warm image optimizer do not represent geographic CDN latency.","Other existing workspace applications were not stopped; this is not an isolated benchmark host.","Initial resource totals can include Next.js link prefetch; scripts and complete request lists are retained."]};
  await mkdir("artifacts/testing",{recursive:true});
  await writeFile("artifacts/testing/performance.json",JSON.stringify(report,null,2));
}finally{await browser.close();}
