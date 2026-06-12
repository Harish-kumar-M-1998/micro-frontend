import { Outlet, NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector, logout, toggleTheme } from '@mfe/shared-auth';
import { Button } from '@mfe/shared-ui';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function AppLayout() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { resolvedTheme } = useAppSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-700">
          <h1 className="text-xl font-bold text-blue-600">MFE Platform</h1>
        </div>

        <nav className="mt-4 space-y-1 px-3" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
                ].join(' ')
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
          <div />

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => dispatch(toggleTheme())}>
              {resolvedTheme === 'dark' ? '☀️' : '🌙'}
            </Button>

            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
