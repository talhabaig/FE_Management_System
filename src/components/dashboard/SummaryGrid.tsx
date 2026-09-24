import { Link } from 'react-router-dom';
import type { DashboardSummary } from '../../types/api';
import { type DashboardCardKey, tasksPathFromDashboard } from '../../lib/paths';

const cards: { key: DashboardCardKey; label: string; detail: string }[] = [
  { key: 'total', label: 'Total', detail: 'Tasks matching the current filters' },
  { key: 'todo', label: 'To do', detail: 'Status is TODO' },
  { key: 'inProgress', label: 'In progress', detail: 'Status is IN_PROGRESS' },
  { key: 'done', label: 'Done', detail: 'Status is DONE' },
  { key: 'highPriority', label: 'High priority', detail: 'Priority is HIGH' },
  { key: 'overdue', label: 'Overdue', detail: 'Deadline has passed and status is not DONE' },
];

interface SummaryGridProps {
  summary: DashboardSummary;
  filterValues: {
    status: string;
    priority: string;
    teamId: string;
    assignedToId: string;
    deadlineFrom: string;
    deadlineTo: string;
  };
}

export function SummaryGrid({ summary, filterValues }: SummaryGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.key}
          to={tasksPathFromDashboard(filterValues, card.key)}
          className="group rounded-2xl border border-sand bg-card p-5 shadow-card transition hover:border-moss/40 hover:bg-moss/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-ink/60">{card.label}</p>
            <span className="text-xs font-semibold text-moss opacity-0 transition group-hover:opacity-100">View tasks →</span>
          </div>
          <p className="mt-2 font-display text-4xl text-ink">{summary[card.key]}</p>
          <p className="mt-2 text-sm text-ink/70">{card.detail}</p>
        </Link>
      ))}
    </div>
  );
}
