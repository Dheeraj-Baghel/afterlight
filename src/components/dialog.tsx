"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactElement, ReactNode, RefObject } from "react";
import { useReducedMotion } from "@/components/providers";

export function Modal({ open, onOpenChange, title, description, trigger, children, returnFocus, className = "" }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string;
  trigger?: ReactElement; children: ReactNode; returnFocus?: RefObject<HTMLElement | null>; className?: string;
}) {
  const reduced = useReducedMotion();
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
    <AnimatePresence>{open && <Dialog.Portal forceMount>
      <Dialog.Overlay forceMount asChild><motion.div className="dialog-overlay" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /></Dialog.Overlay>
      <Dialog.Content forceMount asChild onCloseAutoFocus={event => { if (returnFocus?.current) { event.preventDefault(); returnFocus.current.focus(); } }}>
        <motion.div className={`dialog-content ${className}`} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}>
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          <Dialog.Description className="small-copy pr-6">{description}</Dialog.Description>
          {children}
          <Dialog.Close className="icon-button dialog-close" aria-label="Close dialog"><X size={21} /></Dialog.Close>
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>}</AnimatePresence>
  </Dialog.Root>;
}