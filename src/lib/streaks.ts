import { format, subDays } from 'date-fns';

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function toDateOnly(d: string): Date {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
}

/**
 * Given a set of completed date strings (yyyy-MM-dd), compute:
 * - current: the streak ending today or yesterday (i.e. still "alive")
 * - longest: the longest consecutive run ever logged
 */
export function computeStreaks(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(dates)].sort();
  const dateObjs = sorted.map(toDateOnly);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dateObjs.length; i++) {
    const diffDays = Math.round((dateObjs[i].getTime() - dateObjs[i - 1].getTime()) / 86400000);
    if (diffDays === 1) {
      run += 1;
    } else if (diffDays > 1) {
      run = 1;
    }
    if (run > longest) longest = run;
  }

  // current streak: walk backwards from today (or yesterday if today not logged)
  const dateSet = new Set(sorted);
  const today = todayStr();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  let cursor: string | null = null;
  if (dateSet.has(today)) cursor = today;
  else if (dateSet.has(yesterday)) cursor = yesterday;

  let current = 0;
  if (cursor) {
    let cursorDate = toDateOnly(cursor);
    while (dateSet.has(format(cursorDate, 'yyyy-MM-dd'))) {
      current += 1;
      cursorDate = subDays(cursorDate, 1);
    }
  }

  return { current, longest };
}

/** Last N day strings (yyyy-MM-dd), oldest first, ending today. */
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
  return days;
}
