import { useState } from 'react';
import { Container } from '@/lib/ui/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/lib/ui/Card';
import { Input } from '@/lib/ui/Input';
import { Button } from '@/lib/ui/Button';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Flame, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'sign_in' | 'sign_up';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Account created. If email confirmation is enabled, check your inbox before signing in.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <div className="mx-auto flex max-w-md flex-col items-center py-12">
        <div className="mb-6 flex items-center gap-2 text-h2 text-foreground">
          <Flame size={28} className="text-primary" />
          Streakly
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{mode === 'sign_in' ? 'Welcome back' : 'Create your account'}</CardTitle>
            <CardDescription>
              {mode === 'sign_in'
                ? 'Sign in to track your daily habits.'
                : 'Sign up to start building streaks that stick.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Authentication failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {info && (
                <Alert>
                  <AlertTitle>Check your email</AlertTitle>
                  <AlertDescription>{info}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label className="text-small text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    className="pl-9"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-small text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    minLength={6}
                    className="pl-9"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait\u2026' : mode === 'sign_in' ? 'Sign in' : 'Sign up'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in');
                  setError(null);
                  setInfo(null);
                }}
              >
                {mode === 'sign_in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Container>
  );
}
