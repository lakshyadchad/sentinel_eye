"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookOpen } from "lucide-react";
import ResearchPapersModal from "./ResearchPapersModal";

export default function DashboardHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 p-6 pb-2 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
          Analysis
        </h1>
        <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Live monitoring overview</span>
          <span className="opacity-30">•</span>
          <span>NDVI</span>
          <span className="opacity-30">•</span>
          <span>Encroachment</span>
          <span className="opacity-30">•</span>
          <span className="text-primary">Alerts</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl border-border bg-card font-bold uppercase tracking-widest text-[10px] text-foreground hover:bg-muted shadow-sm transition-all"
            >
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              Research Papers
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border text-foreground rounded-2xl shadow-2xl p-0">
            <VisuallyHidden>
              <DialogTitle>Research Papers</DialogTitle>
            </VisuallyHidden>
            <ResearchPapersModal open={open} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
