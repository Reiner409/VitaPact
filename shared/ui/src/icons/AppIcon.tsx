import {
  CalendarCheck,
  CalendarDays,
  Dumbbell,
  ImageUp,
  Moon,
  NotebookPen,
  Salad,
  Scale,
  Settings,
  Sun,
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
  weighIn: Scale,
  image: ImageUp,
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
