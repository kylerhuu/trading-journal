export default function TradeNotFound() {
  return (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <div className="text-lg font-semibold">Trade not found</div>
      <div className="mt-2 text-sm text-muted-foreground">It may have been deleted or never synced.</div>
    </div>
  );
}
