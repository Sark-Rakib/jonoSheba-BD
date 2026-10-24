import {
  Stethoscope,
  GraduationCap,
  Scale,
  Monitor,
  Wrench,
  Hammer,
  Bus,
  UtensilsCrossed,
  Landmark,
  Sprout,
  Clapperboard,
  Shapes,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Stethoscope,
  GraduationCap,
  Scale,
  Monitor,
  Wrench,
  Hammer,
  Bus,
  UtensilsCrossed,
  Landmark,
  Sprout,
  Clapperboard,
  Shapes,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}): React.ReactNode {
  const Icon = ICONS[name] ?? Shapes;
  return <Icon className={className} aria-hidden="true" />;
}
