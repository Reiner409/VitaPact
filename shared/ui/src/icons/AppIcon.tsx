import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDot,
  Dumbbell,
  ImageUp,
  Info,
  Minus,
  Moon,
  NotebookPen,
  Plus,
  Salad,
  Scale,
  Settings,
  Sun,
  TriangleAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { tokens } from '../tokens';

/** Every icon of the app, chosen once here from Lucide (section 6.1). */
export const appIcons = {
  today: CalendarCheck,
  week: CalendarDays,
  friends: Users,
  noteboard: NotebookPen,
  settings: Settings,
  sleep: Moon,
  training: Dumbbell,
  food: Salad,
  sun: Sun,
  /** Any pillar without an icon of its own, e.g. a new one (RF-23). */
  pillar: CircleDot,
  weighIn: Scale,
  info: Info,
  warning: TriangleAlert,
  success: CircleCheck,
  error: CircleAlert,
  image: ImageUp,
  previous: ChevronLeft,
  next: ChevronRight,
  decrease: Minus,
  increase: Plus,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof appIcons;

export function AppIcon({ name }: { name: IconName }) {
  const Icon = appIcons[name];
  return (
    <Icon
      size={tokens.icon.size}
      strokeWidth={tokens.icon.stroke}
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    />
  );
}
