import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, UserRole } from '../types';
import {
  Users,
  UserPlus,
  Search
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { getRoleBadgeConfig, formatDate } from '../utils/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Min 8 chars with 1 uppercase & 1 number'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER'])
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export const UsersPage: React.FC = () => {
  const { role: currentRole, user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAdmin = currentRole === 'ADMIN';

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () =>
      usersService.getUsers({
        search: search || undefined,
        role: roleFilter || undefined
      })
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'MEMBER'
    }
  });

  const createMutation = useMutation({
    mutationFn: (formData: CreateUserFormData) => usersService.createUser(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Team member account created successfully!');
      reset();
      setIsCreateModalOpen(false);
    },
    onError: (err: any) => toastError(err.message || 'Failed to create user')
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersService.updateUser(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('User role updated');
    },
    onError: (err: any) => toastError(err.message || 'Failed to update role')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersService.updateUser(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('User account status updated');
    },
    onError: (err: any) => toastError(err.message || 'Failed to update status')
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team & User Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization members, assign role permissions, and track active workloads
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
            size="md"
          >
            Add Team Member
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="MEMBER">Member</option>
        </select>
      </div>

      {/* Users Table */}
      {error ? (
        <ErrorState message="Could not load team members." onRetry={refetch} />
      ) : isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Assigned Tasks</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((member: User) => {
                const roleBadge = getRoleBadgeConfig(member.role);
                const isSelf = member.id === currentUser?.id;

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} src={member.avatarUrl} size="sm" />
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            {member.name}
                            {isSelf && (
                              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {isAdmin && !isSelf ? (
                        <select
                          value={member.role}
                          onChange={e => updateRoleMutation.mutate({ id: member.id, role: e.target.value as UserRole })}
                          className="text-xs font-semibold rounded-lg px-2 py-1 border border-slate-300 bg-white"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                          {member.role}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">
                        {member._count?.assignedTasks || 0} active
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-600">
                        {member._count?.projectMemberships || 0} projects
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {formatDate(member.createdAt)}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          member.isActive ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {member.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </TableCell>

                    {isAdmin && (
                      <TableCell className="text-right">
                        {!isSelf && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: member.id, isActive: !member.isActive })}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                              member.isActive
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {member.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No team members found"
          description="No users match the search criteria."
        />
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Team Member"
        description="Create an account for a team member or project lead"
        size="md"
      >
        <form onSubmit={handleSubmit(data => createMutation.mutate(data))} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Jessica Taylor"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Work Email *"
            type="email"
            placeholder="jtaylor@clientflow.io"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Initial Password *"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            error={errors.password?.message}
            {...register('password')}
          />

          <Select
            label="System Role"
            error={errors.role?.message}
            options={[
              { value: 'MEMBER', label: 'Member (Engineer / Designer)' },
              { value: 'MANAGER', label: 'Manager (Project Lead)' },
              { value: 'ADMIN', label: 'Admin (Full Access)' }
            ]}
            {...register('role')}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
