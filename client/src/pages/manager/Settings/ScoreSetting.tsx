import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../../services/center-owner/settings-management/settings.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// No external schema validation; using basic form handling only.

export function ScoreSetting() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings', { group: 'grading' }],
    queryFn: () => settingsService.getAll({ group: 'grading' }),
    refetchOnWindowFocus: false,
  });

  const defaultValue = (data as any[]).find((s: any) => s.key === 'grading.config')?.value ?? {
      weights: { assignment: 0.2, midterm: 0.3, final: 0.5 },
      minScore: 0,
      maxScore: 10,
    }

  const [settings, setSettings] = useState<any>(defaultValue);

  // Đồng bộ state khi dữ liệu fetch về
  useEffect(() => {
    setSettings(defaultValue);
  }, [JSON.stringify(defaultValue)]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      settingsService.upsert({
        key: 'grading.config',
        group: 'grading',
        value: payload,
        description: 'Grading configuration',
      }),
    onSuccess: () => {
      toast.success('Đã lưu cấu hình');
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(settings);
  };

  const updateNumber = (path: string, value: string) => {
    const num = value === '' ? '' : Number(value);
    setSettings((prev: any) => {
      const next = { ...prev };
      if (path.startsWith('weights.')) {
        const key = path.split('.')[1];
        next.weights = { ...next.weights, [key]: num };
      } else {
        (next as any)[path] = num;
      }
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Grading Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trọng số Assignment</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings?.weights?.assignment ?? ''}
                  onChange={(e) => updateNumber('weights.assignment', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trọng số Midterm</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings?.weights?.midterm ?? ''}
                  onChange={(e) => updateNumber('weights.midterm', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trọng số Final</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings?.weights?.final ?? ''}
                  onChange={(e) => updateNumber('weights.final', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Điểm tối thiểu</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings?.minScore ?? ''}
                  onChange={(e) => updateNumber('minScore', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Điểm tối đa</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings?.maxScore ?? ''}
                  onChange={(e) => updateNumber('maxScore', e.target.value)}
                />
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
