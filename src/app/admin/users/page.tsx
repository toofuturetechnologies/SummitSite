/**
 * Admin Users Management Page
 * View, search, filter, and manage all users
 */

'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Shield, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  profile_type: string;
  rating: number;
  created_at: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
          setTotal(data.total);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, search, limit]);

  const totalPages = Math.ceil(total / limit);

  const handleSuspend = async (userId: string) => {
    const reason = prompt('Reason for suspension:');
    if (!reason) return;

    try {
      const res = await fetch('/api/admin/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          reason,
        }),
      });

      if (res.ok) {
        alert('User suspended successfully');
        setPage(1);
      } else {
        alert('Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error suspending user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sky-900 dark:text-sky-100 mb-2">
          User Management
        </h1>
        <p className="text-sky-600 dark:text-sky-400">
          Manage all users on the platform. Search, filter, and take actions.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-sky-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sky-900 dark:text-sky-100 placeholder-sky-400 dark:placeholder-sky-500"
          />
        </div>
        <button className="px-4 py-2 bg-sky-100 dark:bg-sky-900/20 border border-sky-300 dark:border-sky-700 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/30 text-sky-700 dark:text-sky-300 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sky-600 dark:text-sky-400">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sky-600 dark:text-sky-400">
            No users found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sky-50 dark:bg-slate-700 border-b border-sky-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-100">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-100">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-100">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-100">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-100">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-sky-900 dark:text-sky-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-sky-100 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="px-6 py-4 font-medium text-sky-900 dark:text-sky-100">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sky-700 dark:text-sky-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs rounded">
                          {user.profile_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sky-700 dark:text-sky-300">
                        {user.rating ? `${user.rating}★` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-sky-600 dark:text-sky-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                            title="Suspend user"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-sky-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-sm text-sky-600 dark:text-sky-400">
                Showing {users.length} of {total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-sky-200 dark:border-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sky-700 dark:text-sky-300">
                  {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-sky-200 dark:border-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
