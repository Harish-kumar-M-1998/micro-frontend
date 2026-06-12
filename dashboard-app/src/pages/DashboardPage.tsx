import { useEffect, useState } from 'react';
import { Card } from '@mfe/shared-ui';
import { useAppSelector, monitoring, eventBus, MFE_EVENTS } from '@mfe/shared-auth';

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

const MOCK_STATS: StatCard[] = [
  { label: 'Total Users', value: '12,847', change: '+12.5%', trend: 'up' },
  { label: 'Active Sessions', value: '3,421', change: '+8.2%', trend: 'up' },
  { label: 'Reports Generated', value: '892', change: '-2.1%', trend: 'down' },
  { label: 'Revenue', value: '$284K', change: '+18.7%', trend: 'up' },
];

/**
 * Dashboard microfrontend - exposed via Module Federation as dashboardApp/DashboardPage
 */
export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [stats] = useState(MOCK_STATS);

  useEffect(() => {
    monitoring.track({ name: 'page_view', properties: { page: 'dashboard' } });
    monitoring.trackPerformance('dashboard_load', performance.now(), { module: 'dashboard-app' });
  }, []);

  const handleStatClick = (label: string) => {
    eventBus.publish(MFE_EVENTS.NOTIFICATION, { message: `Viewing details for ${label}` }, 'dashboard-app');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Welcome back, {user?.name ?? 'User'}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            title={stat.label}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handleStatClick(stat.label)}
          >
            <p className="text-3xl font-bold">{stat.value}</p>
            <p
              className={`mt-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
            >
              {stat.change} from last month
            </p>
          </Card>
        ))}
      </div>

      <Card title="Recent Activity" subtitle="Latest platform events">
        <ul className="space-y-3">
          {[
            'New user registration: john@example.com',
            'Report "Q2 Sales" generated successfully',
            'System maintenance scheduled for Sunday',
            'User role updated: jane@example.com → manager',
          ].map((activity, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {activity}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
