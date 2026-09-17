import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Container } from '@/lib/ui/Container';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
import { QuickAdd } from '@/components/QuickAdd';
import { HabitCard } from '@/components/HabitCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { HABITS_TABLE, HABIT_LOGS_TABLE } from '@/lib/tables';
import { todayStr } from '@/lib/streaks';
import { Flame } from 'lucide-react';

interface HabitRow {
  id: string;
  name: string;
  archived: boolean;
  created_at: string;
}

interface LogRow {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
}

export function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const today = todayStr();

  const habitsQuery = useQuery({
    queryKey: ['habits', user!.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(HABITS_TABLE)
        .select('id,name,archived,created_at')
        .eq('user_id', user!.id)
        .eq('archived', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as HabitRow[];
    },
  });

  const logsQuery = useQuery({
    queryKey: ['habit_logs', user!.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(HABIT_LOGS_TABLE)
        .select('id,habit_id,log_date,completed')
        .eq('user_id', user!.id)
        .eq('completed', true)
        .order('log_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
  });

  const logsByHabit = useMemo(() => {
    const map = new Map<string, { dates: Set<string>; rowsByDate: Map<string, string> }>();
    for (const log of logsQuery.data ?? []) {
      if (!map.has(log.habit_id)) map.set(log.habit_id, { dates: new Set(), rowsByDate: new Map() });
      const entry = map.get(log.habit_id)!;
      entry.dates.add(log.log_date);
      entry.rowsByDate.set(log.log_date, log.id);
    }
    return map;
  }, [logsQuery.data]);

  const addHabit = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from(HABITS_TABLE).insert({ name, archived: false, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user!.id] }),
  });

  const toggleToday = useMutation({
    mutationFn: async ({ habitId, existingLogId }: { habitId: string; existingLogId?: string }) => {
      if (existingLogId) {
        const { error } = await supabase.from(HABIT_LOGS_TABLE).delete().eq('id', existingLogId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(HABIT_LOGS_TABLE)
          .insert({ habit_id: habitId, log_date: today, completed: true, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habit_logs', user!.id] }),
  });

  const isLoading = habitsQuery.isLoading || logsQuery.isLoading;
  const error = habitsQuery.error || logsQuery.error;

  return (
    <Container>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-display">Your habits</h1>
          <p className="mt-2 text-body text-muted-foreground">Small consistent actions, tracked one day at a time.</p>
        </div>

        <QuickAdd onAdd={(name) => addHabit.mutate(name)} isAdding={addHabit.isPending} />

        {addHabit.isError && (
          <Alert variant="destructive">
            <AlertTitle>Couldn't add habit</AlertTitle>
            <AlertDescription>{(addHabit.error as Error).message}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <CenteredSpinner label="Loading your habits" />
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn't load your habits</AlertTitle>
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        ) : !habitsQuery.data || habitsQuery.data.length === 0 ? (
          <EmptyState
            icon={<Flame size={20} />}
            title="No habits yet"
            description="Add your first habit above — check it off every day to build a streak."
          />
        ) : (
          <div className="space-y-3">
            {habitsQuery.data.map((h) => {
              const entry = logsByHabit.get(h.id);
              const dates = entry?.dates ?? new Set<string>();
              const existingLogId = entry?.rowsByDate.get(today);
              return (
                <HabitCard
                  key={h.id}
                  id={h.id}
                  name={h.name}
                  completedDates={dates}
                  todayStr={today}
                  isToggling={toggleToday.isPending}
                  onToggleToday={() => toggleToday.mutate({ habitId: h.id, existingLogId })}
                />
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
