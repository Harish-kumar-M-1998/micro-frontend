import { apiClient } from '../api/client';
import { isDemoMode } from '../utils/env';
import type { UserProfile } from '../types';

/** Mock users for development/demo */
const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    department: 'Engineering',
    status: 'active',
    lastLogin: '2026-06-12T08:00:00Z',
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'manager',
    department: 'Sales',
    status: 'active',
    lastLogin: '2026-06-11T14:30:00Z',
  },
  {
    id: '3',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    department: 'Marketing',
    status: 'inactive',
    lastLogin: '2026-05-20T09:15:00Z',
  },
];

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const userService = {
  async getUsers(params: UserListParams = {}): Promise<{ users: UserProfile[]; total: number }> {
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 300));
      let filtered = [...MOCK_USERS];
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        );
      }
      if (params.status) {
        filtered = filtered.filter((u) => u.status === params.status);
      }
      return { users: filtered, total: filtered.length };
    }

    const { data } = await apiClient.get('/users', { params });
    return data;
  },

  async getUserById(id: string): Promise<UserProfile> {
    if (isDemoMode()) {
      const user = MOCK_USERS.find((u) => u.id === id);
      if (!user) throw { message: 'User not found', code: 'NOT_FOUND', status: 404 };
      return user;
    }

    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await apiClient.patch(`/users/${id}`, updates);
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
