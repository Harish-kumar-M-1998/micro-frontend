import { useEffect, useState } from 'react';
import { Card, Table, Button } from '@mfe/shared-ui';
import type { Column } from '@mfe/shared-ui';
import {
  reportService,
  eventBus,
  MFE_EVENTS,
  monitoring,
  type ReportSummary,
} from '@mfe/shared-auth';

const statusColors: Record<string, string> = {
  ready: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
};

/**
 * Reports microfrontend - exposed via Module Federation as reportsApp/ReportsPage
 */
export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const params = filter !== 'all' ? { type: filter } : {};
        const { reports: data } = await reportService.getReports(params);
        setReports(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
    monitoring.track({ name: 'page_view', properties: { page: 'reports' } });
  }, [filter]);

  const handleGenerate = async () => {
    const report = await reportService.generateReport('analytics');
    eventBus.publish(MFE_EVENTS.REPORT_GENERATED, report, 'reports-app');
    setReports((prev) => [report, ...prev]);
  };

  const columns: Column<ReportSummary>[] = [
    { key: 'title', header: 'Title', accessor: (r) => r.title },
    { key: 'type', header: 'Type', accessor: (r) => r.type, hideOnMobile: true },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'generatedAt',
      header: 'Generated',
      accessor: (r) => new Date(r.generatedAt).toLocaleDateString(),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-slate-500">Generate and manage platform reports</p>
        </div>
        <Button onClick={handleGenerate}>Generate Report</Button>
      </div>

      <div className="flex gap-2">
        {['all', 'sales', 'analytics', 'compliance'].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'primary' : 'secondary'}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card title="Report List" noPadding>
        <div className="p-4">
          <Table
            data={reports}
            columns={columns}
            keyExtractor={(r) => r.id}
            isLoading={isLoading}
            emptyMessage="No reports found. Generate one to get started."
            caption="Reports listing table"
          />
        </div>
      </Card>
    </div>
  );
}
