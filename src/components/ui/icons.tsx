import {
  CheckSquare,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Clock,
  BarChart3,
  Users,
  Briefcase,
  CalendarDays,
  TrendingUp,
  Database,
  Table2,
  HardDrive,
  Network,
  Files,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import type { StatMetric } from '../../api/types';

export const METRIC_ICON: Record<StatMetric['icon'], LucideIcon> = {
  tasks: CheckSquare,
  files: FileSpreadsheet,
  ai: Sparkles,
  clock: Clock,
  report: BarChart3,
  users: Users,
  briefcase: Briefcase,
  calendar: CalendarDays,
  trend: TrendingUp,
  database: Database,
  table: Table2,
  storage: HardDrive,
  source: Network,
  copy: Files,
};

export { Folder, FileText };
