"use client";
import { useRef, useState } from "react";
import { Link2, Copy, Check } from "lucide-react";
import { Modal } from "@/components/dialog";

export function ShareButton({ label = "Share view" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  return <Modal open={open} onOpenChange={value => { setOpen(value); if (value) { setUrl(window.location.href); setStatus(""); } }} title="A shared perspective." description="This link restores your selection and filters. Your personal expedition and private notes are never included." trigger={<button className="btn-secondary"><Link2 size={16} aria-hidden="true" />{label}</button>}>
    <label htmlFor="share-url" className="field-label mt-6">Link to this view</label>
    <div className="share-field"><input id="share-url" ref={input} readOnly value={url} onFocus={e => e.currentTarget.select()} /><button className="btn-primary" onClick={async () => {
      try { await navigator.clipboard.writeText(url); setStatus("Link copied to your clipboard."); }
      catch { input.current?.focus(); input.current?.select(); setStatus("Automatic copy is unavailable. The link is selected; use your browser's Copy command."); }
    }}>{status.startsWith("Link copied") ? <Check size={16} /> : <Copy size={16} />}Copy</button></div><p role="status" className="status-line mt-3">{status}</p>
  </Modal>;
}