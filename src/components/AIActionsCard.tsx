import { CheckCircle2, Clock, Loader2, FileSpreadsheet, FileText, BarChart3 } from 'lucide-react';
import { api } from '../api';
import type { AIAction } from '../api/types';
import { useAsync } from '../hooks/useAsync';
import { Card, ViewAll, Loading, ProgressBar, StatusChip, aiStatusTone } from './ui';

function appIcon(app: string) {
  if (app.includes('Excel')) return FileSpreadsheet;
  if (app.includes('Document')) return FileText;
  return BarChart3;
}

function StatusIcon({ status }: { status: AIAction['status'] }) {
  if (status === 'Completed') return <CheckCircle2 size={12} className="text-green-600" aria-hidden="true" />;
  if (status === 'In Progress') return <Loader2 size={12} className="text-blue-600" aria-hidden="true" />;
  return <Clock size={12} className="text-muted" aria-hidden="true" />;
}

export function AIActionsCard({ className = '' }: { className?: string }) {
  const { data, loading, error } = useAsync(() => api.listAIActions(), []);
  return (
    <Card className={className} title="AI Actions in Progress" action={<ViewAll />}>
      {loading && <Loading rows={4} />}
      {error && <p className="text-xs text-red-600">{error.message}</p>}
      <ul className="space-y-3">
        {data?.map((a) => {
          const Icon = appIcon(a.app);
          return (
            <li key={a.id} className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <Icon size={14} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-ink">{a.title}</p>
                <p className="text-[10px] text-muted">{a.app}</p>
                {a.progress !== undefined && a.status !== 'Completed' && (
                  <div className="mt-1 w-24">
                    <ProgressBar value={a.progress} tone={a.status === 'In Progress' ? 'blue' : 'green'} />
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusIcon status={a.status} />
                <StatusChip tone={aiStatusTone(a.status)}>{a.status}</StatusChip>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
