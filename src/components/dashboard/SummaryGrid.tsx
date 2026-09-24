import type { DashboardSummary } from '../../types/api';

const cards: { key: keyof DashboardSummary; label: string; detail: string }[] = [
  { key: 'total', label: 'Total', detail: 'Tasks matching the current filters' },
  { key: 'todo', label: 'To do', detail: 'Status is TODO' },
  { key: 'inProgress', label: 'In progress', detail: 'Status is IN_PROGRESS' },
  { key: 'done', label: 'Done', detail: 'Status is DONE' },
  { key: 'highPriority', label: 'High priority', detail: 'Priority is HIGH' },
  { key: 'overdue', label: 'Overdue', detail: 'Deadline has passed and status is not DONE' },
];

export function SummaryGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.key} className="rounded-2xl border border-sand bg-card p-5 shadow-card">
          <p className="text-sm font-semibold text-ink/60">{card.label}</p>
          <p className="mt-2 font-display text-4xl text-ink">{summary[card.key]}</p>
          <p className="mt-2 text-sm text-ink/70">{card.detail}</p>
        </article>
      ))}
    </div>
  );
}
