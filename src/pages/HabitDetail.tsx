import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Container } from '@/lib/ui/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { HABITS_TABLE, HABIT_LOGS_TABLE } from '@/lib/tables';
import { computeStreaks, todayStr } from '@/lib/streaks';
import { ArrowLeft, Trash2, Flame } from 'lucide-react';
import { cn } from '@/lib/cn';

interface HabitRow {
  id: string;
  name: string;
}

interface LogRow {
  id: string;
  log_date: string;
  completed: boolean;
}

const CALENDAR_DAYS = 84;

export function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const today = todayStr();

  const habitQuery = useQuery({
    queryKey: ['habit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(HABITS_TABLE)
        .select('id,name')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data as HabitRow;
    },
    enabled: !!id && !!user,
  });

  const logsQuery = useQuery({
    queryKey: ['habit_logs', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(HABIT_LOGS_TABLE)
        .select('id,log_date,completed')
        .eq('user_id', user!.id)
        .eq('habit_id', id)
        .eq('completed', true)
        .order('log_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
    enabled: !!id && !!user,
  });

  const rowsByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of logsQuery.data ?? []) map.set(log.log_date, log.id);
    return map;
  }, [logsQuery.data]);

  const dates = useMemo(() => new Set(rowsByDate.keys()), [rowsByDate]);
  const { current, longest } = useMemo(() => computeStreaks([...dates]), [dates]);

  const toggleDay = useMutation({
    mutationFn: async ({ date, existingLogId }: { date: string; existingLogId?: string }) => {
      if (existingLogId) {
        const { error } = await supabase.from(HABIT_LOGS_TABLE).delete().eq('id', existingLogId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(HABIT_LOGS_TABLE)
          .insert({ habit_id: id, log_date: date, completed: true, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habit_logs', 'detail', id] });
      qc.invalidateQueries({ queryKey: ['habit_logs', user!.id] });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async () => {
      const { error: logsError } = await supabase.from(HABIT_LOGS_TABLE).delete().eq('habit_id', id).eq('user_id', user!.id);
      if (logsError) throw logsError;
      const { error } = await supabase.from(HABITS_TABLE).delete().eq('id', id).eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits', user!.id] });
      navigate('/');
    },
  });

  const calendarDays = useMemo(() => {
    const days: string[] = [];
    for (let i = CALENDAR_DAYS - 1; i >= 0; i--) days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    return days;
  }, []);

  const isLoading = habitQuery.isLoading || logsQuery.isLoading;
  const error = habitQuery.error || logsQuery.error;

  return (
    <Container>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          Back to habits
        </Button>

        {isLoading ? (
          <CenteredSpinner label="Loading habit" />
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn't load this habit</AlertTitle>
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        ) : !habitQuery.data ? (
          <Alert variant="destructive">
            <AlertTitle>Habit not found</AlertTitle>
            <AlertDescription>It may have been deleted.</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-display">{habitQuery.data.name}</h1>
                <p className="mt-2 text-body text-muted-foreground">Tap any day below to toggle its completion.</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Delete this habit and all its history? This cannot be undone.')) deleteHabit.mutate();
                }}
                disabled={deleteHabit.isPending}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>

            {deleteHabit.isError && (
              <Alert variant="destructive">
                <AlertTitle>Couldn't delete habit</AlertTitle>
                <AlertDescription>{(deleteHabit.error as Error).message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-center justify-between p-4 sm:p-6">
                  <div>
                    <div className="text-micro text-muted-foreground">Current streak</div>
                    <div className="text-h1 tabular-nums text-foreground">{current}</div>
                  </div>
                  {current >= 7 && (
                    <Badge variant="warning">
                      <Flame size={12} className="mr-1" />
                      On fire
                    </Badge>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-micro text-muted-foreground">Longest streak</div>
                  <div className="text-h1 tabular-nums text-foreground">{longest}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Last {CALENDAR_DAYS} days</CardTitle>
                <CardDescription>Green means completed. Click a day to toggle it.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((d) => {
                    const done = dates.has(d);
                    const existingLogId = rowsByDate.get(d);
                    const isFuture = d > today;
                    return (
                      <Button
                        key={d}
                        type="button"
                        variant="ghost"
                        disabled={isFuture || toggleDay.isPending}
                        onClick={() => toggleDay.mutate({ date: d, existingLogId })}
                        title={d}
                        className={cn(
                          'h-10 w-full rounded-md p-0 text-micro tabular-nums transition-colors duration-150',
                          done ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-muted text-muted-foreground hover:bg-muted/70',
                          isFuture && 'opacity-30'
                        )}
                      >
                        {Number(d.slice(8, 10))}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Container>
  );
}
