import { Navigate } from 'react-router-dom';
import { useAppSelector, LoginForm } from '@mfe/shared-auth';
import { Card, Input, Button } from '@mfe/shared-ui';

export function LoginPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <Card title="Sign In" subtitle="Enter your credentials to access the platform" className="w-full max-w-md">
        <LoginForm
          renderInput={({ label, type, value, onChange, error, required }) => (
            <Input
              label={label}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              error={error}
              required={required}
              className="mb-4"
            />
          )}
          renderButton={({ children, isLoading, type }) => (
            <Button type={type} isLoading={isLoading} fullWidth>
              {children}
            </Button>
          )}
        />
        <p className="mt-4 text-center text-xs text-slate-500">
          Demo: use any email with @ and any password
        </p>
      </Card>
    </div>
  );
}
