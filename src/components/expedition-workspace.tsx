"use client";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpRight, Download, Upload, Trash2, RotateCcw, Plus } from "lucide-react";
import { planetById } from "@/data/planets";
import { useLocalStore, mutateExpedition, commitExpedition, retryStorage, resetUnreadableStorage, unreadableBackup } from "@/lib/local-store";
import { emptyExpedition, MAX_IMPORT_BYTES, MAX_NOTE_LENGTH, mergeExpedition, moveDestination, parseExpedition, serializeExpedition, setNote, type Expedition } from "@/lib/expedition";
import { PlanetImage } from "@/components/planet-image";
import { EmptyState } from "@/components/ui";
import { Modal } from "@/components/dialog";
import { useReducedMotion } from "@/components/providers";

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  // Revocation is intentionally deferred so the browser can consume the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExpeditionWorkspace() {
  const { expedition, storage, message } = useLocalStore();
  const reduced = useReducedMotion();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [preview, setPreview] = useState<Expedition | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [undo, setUndo] = useState<Expedition | null>(null);
  const [reading, setReading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const importTrigger = useRef<HTMLButtonElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const ready = storage !== "loading";
  const saved = storage === "saved";

  async function readImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setError(""); setStatus("");
    if (file.size > MAX_IMPORT_BYTES) { setError("This file is too large. Choose an AFTERLIGHT JSON file of 32 KB or less. Your expedition is unchanged."); return; }
    setReading(true);
    try {
      const result = parseExpedition(await file.text());
      if (!result.ok) { setError(result.error); return; }
      setImportMode("merge"); setPreview(result.data);
    } catch { setError("This file could not be read. Try another JSON file. Your current expedition is unchanged."); }
    finally { setReading(false); }
  }
  function exportData() {
    try { downloadText(serializeExpedition(expedition), "afterlight-expedition-v1.json"); setStatus("Export prepared. Your JSON download contains all destinations, their order and your notes."); setError(""); }
    catch { setError("The browser could not prepare a download. Your expedition has not been changed."); }
  }
  function applyImport() {
    if (!preview) return;
    setUndo(expedition);
    const next = importMode === "merge" ? mergeExpedition(expedition, preview) : preview;
    const persisted = commitExpedition(next);
    setPreview(null);
    setStatus(`${importMode === "merge" ? "Merged" : "Restored"} ${next.destinations.length} worlds${persisted ? " and saved to this browser." : " in this tab; export a backup to keep them."} You can undo this change.`);
  }
  return <>
    <div className="expedition-toolbar"><span className="eyebrow" role="status">{ready ? `${String(expedition.destinations.length).padStart(2,"0")} SAVED WORLDS / ${saved ? "ON THIS BROWSER" : "IN THIS TAB"}` : "READING LOCAL JOURNAL"}</span>
      <button className="btn-secondary" onClick={exportData} disabled={!ready}><Download size={15} aria-hidden="true" />Export JSON</button>
      <button ref={importTrigger} className="btn-secondary" onClick={() => fileInput.current?.click()} disabled={!ready || reading}><Upload size={15} aria-hidden="true" />{reading ? "Reading file…" : "Import JSON"}</button>
      <input ref={fileInput} type="file" accept="application/json,.json" aria-label="Import expedition JSON file" className="sr-only" tabIndex={-1} onChange={readImport} />
      <Modal open={clearOpen} onOpenChange={setClearOpen} title="A fresh page?" description="Clearing removes all saved worlds and notes from this browser. You can undo the change while this page stays open, or export a backup first." trigger={<button className="btn-secondary" disabled={!expedition.destinations.length}><Trash2 size={15} aria-hidden="true" />Clear</button>}><div className="dialog-actions"><button className="btn-secondary" onClick={() => setClearOpen(false)}>Keep expedition</button><button className="btn-primary" onClick={() => { setUndo(expedition); const persisted = commitExpedition(emptyExpedition()); setClearOpen(false); setStatus(`Expedition cleared${persisted ? "." : " in this tab; browser storage could not be updated."} Undo is available.`); }}>Clear expedition</button></div></Modal>
    </div>
    {message && <div className="notice expedition-warning" role="alert"><p>{message}</p><div className="flex flex-wrap gap-3">{storage === "corrupt" ? <>
      <button className="btn-secondary" onClick={() => { const raw = unreadableBackup(); if (raw !== null) { try { downloadText(raw, "afterlight-unreadable-backup.json"); setStatus("Original unreadable data prepared for download, unchanged."); } catch { setError("Could not download the original data."); } } }}>Download original data</button>
      <Modal open={recoveryOpen} onOpenChange={setRecoveryOpen} title="Reset unreadable storage?" description="This explicitly replaces the unreadable saved data with an empty expedition. Download the original first if you want to keep it. Any in-tab draft will also be cleared." trigger={<button className="btn-secondary">Reset unreadable storage</button>}><div className="dialog-actions"><button className="btn-secondary" onClick={() => setRecoveryOpen(false)}>Cancel</button><button className="btn-primary" onClick={() => { setUndo(expedition); const persisted = resetUnreadableStorage(); setRecoveryOpen(false); setStatus(persisted ? "Storage reset. Your browser can save a new expedition." : "The reset could not be saved. Keep an exported backup of new work."); }}>Reset and start empty</button></div></Modal>
    </> : <button className="btn-secondary" onClick={() => { const persisted = retryStorage(); setStatus(persisted ? "Your expedition is now saved to this browser." : "Still unable to save. Export JSON to keep your current work."); }}>Retry saving</button>}<button className="btn-secondary" onClick={exportData}>Export current draft</button></div></div>}
    {error && <div className="notice error-notice mt-5" role="alert">{error}</div>}
    <div className="flex flex-wrap items-center gap-4 mt-5"><p role="status" className="status-line">{status}</p>{undo && <button className="btn-secondary" onClick={() => { const persisted = commitExpedition(undo); setUndo(null); setStatus(persisted ? "Previous expedition restored and saved." : "Previous expedition restored in this tab. Export to keep it."); }}><RotateCcw size={14} aria-hidden="true" />Undo last change</button>}</div>
    <h2 ref={listHeading} tabIndex={-1} className="sr-only">Your saved destinations</h2>
    {!ready ? <p className="py-12 small-copy" role="status">Reading your local expedition…</p> : expedition.destinations.length === 0 ? <EmptyState title="Where will curiosity take you?" href="/atlas" label="Find your first world">Your journal is a blank page. Save a world in the atlas or on its detail page, then return here to add a question, a thought or a plan for what to read next.</EmptyState> : <>
      <ol className="expedition-list"><AnimatePresence initial={false}>{expedition.destinations.map((destination, index) => { const world = planetById[destination.planetId]; return <motion.li layout={!reduced} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={world.id} className="expedition-item" data-world={world.id}>
        <span className="eyebrow" aria-label={`Destination ${index+1}`}>{String(index+1).padStart(2,"0")}</span><PlanetImage id={world.id} decorative sizes="150px" />
        <div><div className="expedition-note-heading"><h2><Link href={`/worlds/${world.id}`}>{world.name}<ArrowUpRight size={16} className="inline ml-2" aria-hidden="true" /></Link></h2><span className="eyebrow">{world.shortFact}</span></div><label className="field-label" htmlFor={`note-${world.id}`}>Your note for {world.name}</label><textarea id={`note-${world.id}`} maxLength={MAX_NOTE_LENGTH} value={destination.note} placeholder="A question worth keeping…" onChange={e => { mutateExpedition(current => setNote(current, world.id, e.target.value)); }} aria-describedby={`note-meta-${world.id}`} /><div className="note-meta" id={`note-meta-${world.id}`}><span>{saved ? "Saved automatically on this browser" : "In this tab only — export to keep"}</span><span>{destination.note.length}/{MAX_NOTE_LENGTH}</span></div></div>
        <div className="destination-controls" role="group" aria-label={`Reorder or remove ${world.name}`}><button className="icon-button" aria-label={`Move ${world.name} up`} disabled={index === 0} onClick={() => { mutateExpedition(current => moveDestination(current, world.id, -1)); setStatus(`${world.name} moved to position ${index}. Notes preserved.`); }}><ArrowUp size={16} /></button><button className="icon-button" aria-label={`Move ${world.name} down`} disabled={index === expedition.destinations.length - 1} onClick={() => { mutateExpedition(current => moveDestination(current, world.id, 1)); setStatus(`${world.name} moved to position ${index+2}. Notes preserved.`); }}><ArrowDown size={16} /></button><button className="icon-button" aria-label={`Remove ${world.name} from expedition`} onClick={() => { setUndo(expedition); mutateExpedition(current => ({ version: 1, destinations: current.destinations.filter(d => d.planetId !== world.id) })); setStatus(`${world.name} removed. Undo is available.`); listHeading.current?.focus(); }}><Trash2 size={15} /></button></div>
      </motion.li>; })}</AnimatePresence></ol><Link href="/atlas" className="arrow-link"><Plus size={16} aria-hidden="true" />Add another world</Link>
    </>}
    <Modal open={preview !== null} onOpenChange={open => { if (!open) setPreview(null); }} title="Your next chapter." description="Review this file before changing your expedition. Nothing is applied until you choose Import." returnFocus={importTrigger}>
      <ol className="import-preview-list">{preview?.destinations.map((destination,index) => <li key={destination.planetId}><strong>{index+1}. {planetById[destination.planetId].name}</strong><p>{destination.note || "No personal note"}</p></li>)}{preview?.destinations.length === 0 && <li>This file contains an empty expedition.</li>}</ol>
      <fieldset><legend className="field-label">How should these worlds be added?</legend><label className="import-choice"><input type="radio" name="import-mode" value="merge" checked={importMode === "merge"} onChange={() => setImportMode("merge")} /><span>Merge with my expedition<small>Keep your existing order and notes. Append only new worlds, in file order. Existing notes are never overwritten.</small></span></label><label className="import-choice"><input type="radio" name="import-mode" value="replace" checked={importMode === "replace"} onChange={() => setImportMode("replace")} /><span>Replace my expedition<small>Use the exact order and notes from the file. Your current list is replaced; undo remains available on this page.</small></span></label></fieldset>
      <div className="dialog-actions"><button className="btn-secondary" onClick={() => setPreview(null)}>Cancel import</button><button className="btn-primary" onClick={applyImport}>Import expedition</button></div>
    </Modal>
    <div className="sources-block mt-12"><p className="small-copy">Your expedition is stored locally in this browser, not in an account or a cloud service. Other browsers and devices do not share it. Clearing browser data removes it. Use Export JSON for a backup you control. Files are limited to 32 KB; notes to 600 characters. This is a fictional reading journey, never an offer of space travel.</p></div>
  </>;
}