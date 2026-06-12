import { Card, Button } from '@mfe/shared-ui';
import { useAppDispatch, useAppSelector, setThemeMode } from '@mfe/shared-auth';
import type { ThemeMode } from '@mfe/shared-auth';

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);

  const themes: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card title="Profile" subtitle="Your account information">
        {user && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium capitalize">{user.role}</dd>
            </div>
          </dl>
        )}
      </Card>

      <Card title="Appearance" subtitle="Customize the look and feel">
        <div className="flex gap-2">
          {themes.map((t) => (
            <Button
              key={t.value}
              variant={mode === t.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => dispatch(setThemeMode(t.value))}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
