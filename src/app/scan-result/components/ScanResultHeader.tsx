"use client";

interface ScanResultHeaderProps {
  loading: boolean;
  error: string | null;
  onReload: () => void | Promise<void>;
}

export default function ScanResultHeader({
  loading,
  error,
  onReload,
}: ScanResultHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4 border-b border-border/50">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
          Results
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
          <span>Sentinel Eye overview</span>
          <span className="opacity-30">•</span>
          <span>NDVI</span>
          <span className="opacity-30">•</span>
          <span>Encroachment</span>
          <span className="opacity-30">•</span>
          <span>Alerts</span>
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive font-medium bg-destructive/10 px-3 py-1 rounded-md border border-destructive/20">
            {error}
          </p>
        )}
      </div>

      <button
        onClick={onReload}
        disabled={loading}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest
          transition-all focus:outline-none focus:ring-2 focus:ring-ring
          ${
            loading
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
          }
        `}
      >
        {loading ? (
          <>
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Reloading…
          </>
        ) : (
          "Reload Scan"
        )}
      </button>
    </div>
  );
}
