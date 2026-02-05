import { Suspense } from "react";
import ScanResultClient from "./ScanResultClient";

export default function ScanResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="rounded-2xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground">
            Loading results...
          </div>
        </div>
      }
    >
      <ScanResultClient />
    </Suspense>
  );
}
