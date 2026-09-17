import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { Button } from '@/lib/ui/Button';
import { Check, ChevronRight, Flame } from 'lucide-react';
import { cn } from '@/lib/cn';
import { computeStreaks, lastNDays } from '@/lib/streaks';

interface HabitCardProps {
  id: string;
  name: string;
  completedDates: Set<string>;
  todayStr: string;
  isToggling: boolean;
  onToggleToday: () => void;
}

export function HabitCard({ id, name, completedDates, todayStr, isToggling, onToggleToday }: HabitCardProps) {
  const { current } = computeStreaks([...completedDates]);
  const doneToday = completedDates.has(todayStr);
  const strip = lastNDays(7);
  const onFire = current >= 7;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onToggleToday}
          disabled={isToggling}
          aria-label={doneToday ? 'Mark not done today' : 'Mark done today'}
          className={cn(
            'h-12 w-12 shrink-0 rounded-full border-2 p-0 transition-all duration-150',
            doneToday
              ? 'border-success bg-success/20 text-success hover:bg-success/30'
              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
          )}
        >
          {doneToday ? <Check size={22} /> : null}
        </Button>

        <Link to={`/habit/${id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-medium text-foreground">{name}</span>
            {onFire && (
              <Badge variant="warning">
                <Flame size={12} className="mr-1" />
                On fire
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1">
            {strip.map((d) => (
              <span
                key={d}
                title={d}
                className={cn(
                  'h-2 w-5 rounded-full',
                  completedDates.has(d) ? 'bg-success' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="text-h3 tabular-nums text-foreground">{current}</div>
            <div className="text-micro text-muted-foreground">day streak</div>
          </div>
          <Link to={`/habit/${id}`} aria-label={`View ${name} details`}>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
