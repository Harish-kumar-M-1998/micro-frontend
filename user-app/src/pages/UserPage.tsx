import { useEffect, useState } from 'react';
import { Card, Table, Input, Button, Modal } from '@mfe/shared-ui';
import type { Column } from '@mfe/shared-ui';
import {
  useAppDispatch,
  useAppSelector,
  fetchUsers,
  selectUser,
  eventBus,
  MFE_EVENTS,
  monitoring,
  type UserProfile,
} from '@mfe/shared-auth';

/**
 * User Management microfrontend - exposed via Module Federation as userApp/UserPage
 */
export default function UserPage() {
  const dispatch = useAppDispatch();
  const { users, isLoading, totalCount } = useAppSelector((state) => state.user);
  const { selectedUser } = useAppSelector((state) => state.user);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({}));
    monitoring.track({ name: 'page_view', properties: { page: 'users' } });
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(fetchUsers({ search }));
  };

  const handleRowClick = (user: UserProfile) => {
    dispatch(selectUser(user));
    eventBus.publish(MFE_EVENTS.USER_SELECTED, user, 'user-app');
    setShowModal(true);
  };

  const columns: Column<UserProfile>[] = [
    { key: 'name', header: 'Name', accessor: (u) => u.name },
    { key: 'email', header: 'Email', accessor: (u) => u.email },
    { key: 'role', header: 'Role', accessor: (u) => u.role, hideOnMobile: true },
    { key: 'department', header: 'Department', accessor: (u) => u.department ?? '-', hideOnMobile: true },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            u.status === 'active'
              ? 'bg-green-100 text-green-800'
              : u.status === 'inactive'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {u.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <Button size="sm" variant="ghost" onClick={() => handleRowClick(u)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-slate-500">{totalCount} users total</p>
        </div>
      </div>

      <Card title="Users" noPadding>
        <div className="flex gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-sm"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <div className="p-4">
          <Table
            data={users}
            columns={columns}
            keyExtractor={(u) => u.id}
            isLoading={isLoading}
            caption="User management table"
          />
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="User Details"
        footer={<Button onClick={() => setShowModal(false)}>Close</Button>}
      >
        {selectedUser && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd>{selectedUser.name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd>{selectedUser.email}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd className="capitalize">{selectedUser.role}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Department</dt><dd>{selectedUser.department}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Last Login</dt><dd>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : '-'}</dd></div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
