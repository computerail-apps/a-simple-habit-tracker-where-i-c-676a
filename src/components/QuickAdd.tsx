import { useState } from 'react';
import { Input } from '@/lib/ui/Input';
import { Button } from '@/lib/ui/Button';
import { Plus } from 'lucide-react';

interface QuickAddProps {
  onAdd: (name: string) => void;
  isAdding: boolean;
}

export function QuickAdd({ onAdd, isAdding }: QuickAddProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Add a new habit, e.g. Drink water"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isAdding}
      />
      <Button type="submit" disabled={isAdding || !value.trim()}>
        <Plus size={16} />
        Add
      </Button>
    </form>
  );
}
