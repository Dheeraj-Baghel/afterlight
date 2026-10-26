import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { STORAGE_KEY } from "../../src/lib/expedition";

async function saveWorld(page: Page, id: string) {
  await page.goto(`/worlds/${id}`);
  await page.getByRole("button", { name: `Save ${id[0].toUpperCase()+id.slice(1)}`, exact: true }).click();
  await expect(page.getByRole("button", { name: `Unsave ${id[0].toUpperCase()+id.slice(1)}`, exact: true })).toHaveAttribute("aria-pressed", "true");
}
async function seedJournal(page: Page) {
  await page.addInitScript(({ key, data }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(data)); }, { key: STORAGE_KEY, data: { version: 1, destinations: [{ planetId: "earth", note: "Our starting point." }, { planetId: "mars", note: "Follow the water." }, { planetId: "neptune", note: "Why these winds?" }] } });
}

test("home → atlas → Saturn → world → atlas preserves selection and filters", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find your");
  await page.getByRole("link", { name: "Explore the atlas", exact: true }).first().click();
  await page.getByRole("button", { name: "Gas giants", exact: true }).click();
  await page.getByRole("button", { name: "Select Saturn", exact: true }).click();
  await expect(page.locator(".atlas-info h2")).toHaveText("Saturn");
  await expect(page).toHaveURL(/group=gas/);
  await page.getByRole("link", { name: "Explore Saturn", exact: true }).click();
  await expect(page).toHaveURL(/\/worlds\/saturn/);
  await page.getByRole("link", { name: "Back to the atlas", exact: true }).click();
  await expect(page.locator(".atlas-info h2")).toHaveText("Saturn");
  await expect(page.getByRole("button", { name: "Gas giants", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Select Jupiter", exact: true }).click();
  await expect(page.locator(".atlas-info h2")).toHaveText("Jupiter");
  await page.goBack();
  await expect(page.locator(".atlas-info h2")).toHaveText("Saturn");
  await page.goForward();
  await expect(page.locator(".atlas-info h2")).toHaveText("Jupiter");
  expect(errors).toEqual([]);
});

test("direct shared atlas link restores world, filters, list and comparison", async ({ page }) => {
  await page.goto("/atlas?world=neptune&group=ice&q=nep&view=list&compare=earth,mars");
  await expect(page.locator(".atlas-info h2")).toHaveText("Neptune");
  await expect(page.getByLabel("Search planets")).toHaveValue("nep");
  await expect(page.getByRole("button", { name: "Ice giants", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "2D list", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".atlas-list-item")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Open workspace" })).toHaveAttribute("href", "/compare?worlds=earth,mars");
  await page.reload();
  await expect(page.locator(".atlas-info h2")).toHaveText("Neptune");
});

test("comparison adds three worlds, prevents duplicates, replaces/removes and restores units", async ({ page }) => {
  await page.goto("/compare");
  await page.getByLabel("Start with a world").selectOption("earth");
  await expect(page.locator("#add-compare-world option[value=earth]")).toBeDisabled();
  await page.getByLabel("Add another perspective").selectOption("mars");
  await page.getByLabel("Add another perspective").selectOption("neptune");
  await expect(page.locator(".compare-slot")).toHaveCount(3);
  await expect(page.locator("#add-compare-world")).toHaveCount(0);
  await expect(page.getByText(/Three worlds maximum/)).toBeVisible();
  await expect(page.locator("#compare-world-0 option[value=mars]")).toBeDisabled();
  await page.getByLabel("Radius unit").selectOption("mi");
  await page.getByLabel("Rotation unit").selectOption("days");
  await expect(page.locator(".comparison-table")).toContainText("mi");
  await page.reload();
  await expect(page.locator("#compare-world-0")).toHaveValue("earth");
  await expect(page.locator("#compare-world-1")).toHaveValue("mars");
  await expect(page.locator("#compare-world-2")).toHaveValue("neptune");
  await expect(page.getByLabel("Radius unit")).toHaveValue("mi");
  await expect(page.getByLabel("Rotation unit")).toHaveValue("days");
  await page.locator("#compare-world-1").selectOption("saturn");
  await expect(page.locator("#compare-world-1")).toHaveValue("saturn");
  await page.getByRole("button", { name: "Remove Saturn from comparison" }).click();
  await expect(page.locator(".compare-slot")).toHaveCount(2);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A little context changes everything." })).toBeVisible();
});

test("atlas comparison limit explains fourth selection without losing three chosen worlds", async ({ page }) => {
  await page.goto("/atlas?view=list&world=saturn&compare=earth,mars,neptune");
  await page.locator(".atlas-info").getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByText(/Comparison is full/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Open workspace" })).toHaveAttribute("href", "/compare?worlds=earth,mars,neptune");
  await page.getByRole("button", { name: "Remove Mars from comparison", exact: true }).click();
  await page.locator(".atlas-info").getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByRole("link", { name: "Open workspace" })).toHaveAttribute("href", "/compare?worlds=earth,neptune,saturn");
});

test("mission search, destination, type and sorting persist through story return and reload", async ({ page }) => {
  await page.goto("/missions");
  await page.getByLabel("Search the archive").fill("voyager");
  await page.getByLabel("Destination", { exact: true }).selectOption("neptune");
  await page.getByLabel("Mission type").selectOption("flyby");
  await page.getByLabel("Sort by").selectOption("oldest");
  await expect(page.locator(".mission-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Read Voyager 2 mission story" }).click();
  await expect(page.locator(".mission-timeline li")).toHaveCount(5);
  await page.getByRole("link", { name: "Back to mission archive" }).click();
  await expect(page.getByLabel("Search the archive")).toHaveValue("voyager");
  await expect(page.getByLabel("Destination", { exact: true })).toHaveValue("neptune");
  await expect(page.getByLabel("Mission type")).toHaveValue("flyby");
  await expect(page.getByLabel("Sort by")).toHaveValue("oldest");
  await page.reload();
  await expect(page.locator(".mission-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".mission-card")).toHaveCount(8);
  await page.getByLabel("Search the archive").fill("nothing-matches-this");
  await expect(page.getByRole("heading", { name: "No signal. Try another angle." })).toBeVisible();
  await page.getByRole("button", { name: "Show all missions" }).click();
  await expect(page.locator(".mission-card")).toHaveCount(8);
});

test("save three worlds, edit notes, reorder and reload preserves order and notes", async ({ page }) => {
  await saveWorld(page,"earth");
  await saveWorld(page,"mars");
  await saveWorld(page,"neptune");
  await page.goto("/expedition");
  await page.getByLabel("Your note for Earth").fill("Home, but not the default.");
  await page.getByLabel("Your note for Mars").fill("Read the delta.\nAsk about ancient water.");
  await page.getByLabel("Your note for Neptune").fill("Why are the winds so fast?");
  await page.getByRole("button", { name: "Move Neptune up" }).click();
  await page.getByRole("button", { name: "Move Neptune up" }).click();
  await expect(page.locator(".expedition-item").first()).toHaveAttribute("data-world","neptune");
  await page.reload();
  await expect(page.locator(".expedition-item").first()).toHaveAttribute("data-world","neptune");
  await expect(page.getByLabel("Your note for Mars")).toHaveValue("Read the delta.\nAsk about ancient water.");
  await expect(page.getByLabel("Your note for Earth")).toHaveValue("Home, but not the default.");
  await expect(page.getByRole("button", { name: "Move Neptune up" })).toBeDisabled();
  await page.getByRole("button", { name: "Remove Earth from expedition" }).click();
  await expect(page.locator(".expedition-item")).toHaveCount(2);
  await page.getByRole("button", { name: "Undo last change" }).click();
  await expect(page.getByLabel("Your note for Earth")).toHaveValue("Home, but not the default.");
});

test("export → clear → preview → replace import restores the exact expedition", async ({ page }) => {
  await seedJournal(page);
  await page.goto("/expedition");
  await page.getByRole("button", { name: "Move Neptune up" }).click();
  const before = await page.evaluate(key => localStorage.getItem(key),STORAGE_KEY);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const exported = readFileSync(path!,"utf8");
  expect(JSON.parse(exported)).toEqual(JSON.parse(before!));
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep expedition" }).click();
  await expect(page.locator(".expedition-item")).toHaveCount(3);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: "Clear expedition", exact: true }).click();
  await expect(page.locator(".expedition-item")).toHaveCount(0);
  await page.getByLabel("Import expedition JSON file").setInputFiles({name:"expedition.json",mimeType:"application/json",buffer:Buffer.from(exported)});
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".import-preview-list li")).toHaveCount(3);
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).destinations.length,STORAGE_KEY)).toBe(0);
  await page.getByLabel("Replace my expedition", { exact: false }).check();
  await page.getByRole("button", { name: "Import expedition", exact: true }).click();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),STORAGE_KEY)).toEqual(JSON.parse(before!));
  await page.reload();
  await expect(page.locator(".expedition-item").nth(1)).toHaveAttribute("data-world","neptune");
  await expect(page.getByLabel("Your note for Mars")).toHaveValue("Follow the water.");
});

test("merge import preserves existing notes and appends only new worlds", async ({ page }) => {
  await seedJournal(page); await page.goto("/expedition");
  const data={version:1,destinations:[{planetId:"mars",note:"Must not overwrite"},{planetId:"saturn",note:"Ring questions."}]};
  await page.getByLabel("Import expedition JSON file").setInputFiles({name:"merge.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(data))});
  await expect(page.getByLabel("Merge with my expedition",{exact:false})).toBeChecked();
  await page.getByRole("button",{name:"Import expedition",exact:true}).click();
  await expect(page.locator(".expedition-item")).toHaveCount(4);
  await expect(page.getByLabel("Your note for Mars")).toHaveValue("Follow the water.");
  await expect(page.locator(".expedition-item").last()).toHaveAttribute("data-world","saturn");
  await expect(page.getByLabel("Your note for Saturn")).toHaveValue("Ring questions.");
});

test("malformed, oversized, unsupported, unknown and duplicate imports never destroy data", async ({ page }) => {
  await seedJournal(page); await page.goto("/expedition");
  const before = await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY);
  const fixtures=[
    {text:"{wrong",message:/not valid JSON/},
    {text:"x".repeat(33000),message:/too large/},
    {text:'{"version":2,"destinations":[]}',message:/Unsupported expedition version/},
    {text:'{"version":1,"destinations":[{"planetId":"pluto","note":""}]}',message:/unknown planet identifier/},
    {text:'{"version":1,"destinations":[{"planetId":"mars","note":""},{"planetId":"mars","note":""}]}',message:/duplicate world/}
  ];
  for(const fixture of fixtures) {
    await page.getByLabel("Import expedition JSON file").setInputFiles({name:"bad.json",mimeType:"application/json",buffer:Buffer.from(fixture.text)});
    await expect(page.locator("main").getByRole("alert")).toContainText(fixture.message);
    expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBe(before);
    await expect(page.locator(".expedition-item")).toHaveCount(3);
  }
});

test("corrupt persisted bytes are preserved until an explicit recovery reset", async ({ page }) => {
  await page.addInitScript(key=>localStorage.setItem(key,"{my-corrupt-original"),STORAGE_KEY);
  await page.goto("/expedition");
  await expect(page.locator("main").getByRole("alert")).toContainText("original has not been overwritten");
  expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBe("{my-corrupt-original");
  const downloading=page.waitForEvent("download");
  await page.getByRole("button",{name:"Download original data"}).click();
  const download=await downloading;
  expect(readFileSync((await download.path())!,"utf8")).toBe("{my-corrupt-original");
  await page.getByRole("button",{name:"Reset unreadable storage",exact:true}).click();
  await page.getByRole("button",{name:"Cancel",exact:true}).click();
  expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBe("{my-corrupt-original");
  await page.getByRole("button",{name:"Reset unreadable storage",exact:true}).click();
  await page.getByRole("button",{name:"Reset and start empty"}).click();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),STORAGE_KEY)).toEqual({version:1,destinations:[]});
});

test("unavailable local storage offers an in-tab journal and export instead of false saved status", async ({ page }) => {
  await page.addInitScript(()=>{
    Storage.prototype.getItem=function(){throw new DOMException("Blocked","SecurityError");};
    Storage.prototype.setItem=function(){throw new DOMException("Blocked","SecurityError");};
  });
  await saveWorld(page,"mars");
  await page.getByRole("link",{name:/My expedition/}).first().click();
  await expect(page.locator("main").getByRole("alert")).toContainText(/could not be saved|unavailable/);
  await expect(page.getByLabel("Your note for Mars")).toBeVisible();
  await page.getByLabel("Your note for Mars").fill("Keep this exported, not lost.");
  await expect(page.getByText("In this tab only — export to keep")).toBeVisible();
  const pending=page.waitForEvent("download");
  await page.getByRole("button",{name:"Export JSON",exact:true}).click();
  const result=JSON.parse(readFileSync((await (await pending).path())!,"utf8"));
  expect(result.destinations[0].note).toBe("Keep this exported, not lost.");
});

test("storage quota failures retain changed notes in memory and recover on retry", async ({ page }) => {
  await seedJournal(page); await page.goto("/expedition");
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Object.defineProperty(window,"__restoreStorage",{value:()=>{Storage.prototype.setItem=original;},configurable:true});
    Storage.prototype.setItem=function(){throw new DOMException("Full","QuotaExceededError");};
  });
  await page.getByLabel("Your note for Mars").fill("A new unsaved question.");
  await expect(page.locator("main").getByRole("alert")).toContainText("latest changes could not be saved");
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).destinations[1].note,STORAGE_KEY)).toBe("Follow the water.");
  await page.evaluate(()=>{(window as unknown as {__restoreStorage:()=>void}).__restoreStorage();});
  await page.getByRole("button",{name:"Retry saving"}).click();
  await expect(page.getByText("Your expedition is now saved to this browser.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Your note for Mars")).toHaveValue("A new unsaved question.");
});

test("imported HTML stays text, note limit is enforced, and import dialog restores focus", async ({ page }) => {
  await page.goto("/expedition");
  await page.getByRole("button",{name:"Import JSON",exact:true}).focus();
  const text='<img src=x onerror="window.badImport=true">';
  await page.getByLabel("Import expedition JSON file").setInputFiles({name:"text.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify({version:1,destinations:[{planetId:"earth",note:text}]}))});
  await expect(page.locator(".import-preview-list")).toContainText(text);
  await expect(page.locator(".import-preview-list img")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Import JSON",exact:true})).toBeFocused();
  expect(await page.evaluate(()=>"badImport" in window)).toBe(false);
});
