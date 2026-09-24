export function Spinner({ label = 'Loading', hideLabel = true }: { label?: string; hideLabel?: boolean }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-current">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      />
      <span className={hideLabel ? 'sr-only' : 'text-sm font-medium'}>{label}</span>
    </span>
  );
}
