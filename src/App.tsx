import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AuthScreen } from '@/components/AuthScreen';
import { Dashboard } from '@/pages/Dashboard';
import { HabitDetail } from '@/pages/HabitDetail';
import { Nav } from '@/lib/ui/Nav';
import { Button } from '@/lib/ui/Button';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Flame, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <Nav
        brand={
          <span className="inline-flex items-center gap-2">
            <Flame size={18} className="text-primary" />
            Streakly
          </span>
        }
        actions={
          user ? (
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut size={16} />
              Sign out
            </Button>
          ) : null
        }
      />
      <main className="py-8">{children}</main>
    </div>
  );
}

function Gate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Shell>
        <CenteredSpinner label="Loading your account" />
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <AuthScreen />
      </Shell>
    );
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
