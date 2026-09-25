import { SORT_OPTIONS, SORT_ORDER_OPTIONS, TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../../lib/labels';
import type { Team, User } from '../../types/api';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TextField } from '../ui/TextField';

export interface TaskFilterValues {
  search: string;
  status: string;
  priority: string;
  teamId: string;
  assignedToId: string;
  deadlineFrom: string;
  deadlineTo: string;
  sortBy: string;
  sortOrder: string;
}

interface TaskFiltersProps {
  values: TaskFilterValues;
  teams: Team[];
  assignees: User[];
  showAssignee: boolean;
  dateError?: string;
  onSearchChange: (value: string) => void;
  onChange: (name: Exclude<keyof TaskFilterValues, 'search'>, value: string) => void;
  onClear: () => void;
}

export function TaskFilters({
  values,
  teams,
  assignees,
  showAssignee,
  dateError,
  onSearchChange,
  onChange,
  onClear,
}: TaskFiltersProps) {
  return (
    <div className="rounded-2xl border border-sand bg-card p-4 shadow-card">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <TextField
          label="Search"
          name="search"
          value={values.search}
          maxLength={100}
          placeholder="Title or description"
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Select
          label="Status"
          name="status"
          value={values.status}
          placeholder="All statuses"
          options={TASK_STATUS_OPTIONS}
          onChange={(event) => onChange('status', event.target.value)}
        />
        <Select
          label="Priority"
          name="priority"
          value={values.priority}
          placeholder="All priorities"
          options={TASK_PRIORITY_OPTIONS}
          onChange={(event) => onChange('priority', event.target.value)}
        />
        <Select
          label="Team"
          name="teamId"
          value={values.teamId}
          placeholder="All teams"
          options={teams.map((team) => ({ value: team.id, label: team.name }))}
          onChange={(event) => onChange('teamId', event.target.value)}
        />
        {showAssignee ? (
          <Select
            label="Assignee"
            name="assignedToId"
            value={values.assignedToId}
            placeholder="Anyone"
            options={assignees.map((user) => ({ value: user.id, label: `${user.name} (${user.email})` }))}
            onChange={(event) => onChange('assignedToId', event.target.value)}
          />
        ) : null}
        <TextField
          label="Deadline from"
          name="deadlineFrom"
          type="date"
          value={values.deadlineFrom}
          error={dateError}
          onChange={(event) => onChange('deadlineFrom', event.target.value)}
        />
        <TextField
          label="Deadline to"
          name="deadlineTo"
          type="date"
          value={values.deadlineTo}
          onChange={(event) => onChange('deadlineTo', event.target.value)}
        />
        <Select
          label="Sort by"
          name="sortBy"
          value={values.sortBy}
          options={SORT_OPTIONS}
          onChange={(event) => onChange('sortBy', event.target.value)}
        />
        <Select
          label="Sort order"
          name="sortOrder"
          value={values.sortOrder}
          options={SORT_ORDER_OPTIONS}
          onChange={(event) => onChange('sortOrder', event.target.value)}
        />
      </div>
      <div className="mt-4">
        <Button type="button" variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
