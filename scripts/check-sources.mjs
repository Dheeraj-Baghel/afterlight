// Network provenance check. Facts are reviewed separately; HTTP success is not
// evidence that a scientific claim is true. Uses system curl certificate trust.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
const content = (await Promise.all(["src/data/planets.ts","src/data/missions.ts"].map(p=>readFile(p,"utf8")))).join("\n");
const planetIds=["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"];
const urls=[...new Set([...content.matchAll(/url:\s*"(https:[^"]+)"/g)].map(m=>m[1]).concat(planetIds.map(id=>`https://science.nasa.gov/${id}/facts/`)))];
const results=[];
for(let i=0;i<urls.length;i+=4){
  await Promise.all(urls.slice(i,i+4).map(async url=>{
    try{
      const {stdout}=await run("curl",["-sS","-L","--max-time","35","-A","Mozilla/5.0","-o","/dev/null","-w","%{http_code}\t%{url_effective}",url],{timeout:40000});
      const [status,effective]=stdout.split("\t"); results.push({url,status:Number(status),effective});
      console.log(status,url);
    }catch(error){results.push({url,status:0,error:String(error.message)});console.log("ERROR",url);}
  }));
}
await mkdir("artifacts/testing",{recursive:true});
await writeFile("artifacts/testing/source-links.json",JSON.stringify({checkedAt:new Date().toISOString(),note:"HTTP availability only; factual review recorded in SOURCES.md",results},null,2));
if(results.some(r=>r.status<200||r.status>=400)) process.exitCode=1;
