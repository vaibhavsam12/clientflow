import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../services/clients.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Client } from '../types';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Archive,
  Mail
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { ClientModal } from '../components/clients/ClientModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const ClientsPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Client | null>(null);

  const canManage = role === 'ADMIN' || role === 'MANAGER';
  const canArchive = role === 'ADMIN';

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clients', page, search, statusFilter],
    queryFn: () =>
      clientsService.getClients({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined
      })
  });

  const createMutation = useMutation({
    mutationFn: (formData: any) => clientsService.createClient(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Client account created successfully!');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to create client');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => clientsService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Client details updated successfully!');
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to update client');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => clientsService.archiveClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Client archived successfully!');
      setArchiveTarget(null);
    },
    onError: (err: any) => {
      toastError(err.message || 'Failed to archive client');
    }
  });

  const handleModalSubmit = async (formData: any) => {
    if (selectedClient) {
      await updateMutation.mutateAsync({ id: selectedClient.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleConfirmArchive = async () => {
    if (archiveTarget) {
      await archiveMutation.mutateAsync(archiveTarget.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Client Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage partner organizations, primary stakeholders, and active account contracts
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => {
              setSelectedClient(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            size="md"
          >
            Add Client
          </Button>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client or company..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Table / Content View */}
      {error ? (
        <ErrorState message="Could not load clients." onRetry={refetch} />
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
                <TableHead>Client Organization</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Active Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((client: Client) => {
                const primaryContact = client.contacts?.[0];

                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        to={`/clients/${client.id}`}
                        className="group flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 font-bold text-xs flex-shrink-0 group-hover:bg-brand-600 group-hover:text-white transition">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition">
                            {client.name}
                          </div>
                          {client.company && (
                            <div className="text-[11px] text-slate-500">{client.company}</div>
                          )}
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      {primaryContact ? (
                        <div>
                          <div className="text-xs font-medium text-slate-900">{primaryContact.name}</div>
                          <div className="text-[11px] text-slate-500">{primaryContact.email}</div>
                        </div>
                      ) : client.email ? (
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{client.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No contact specified</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {client._count?.projects || 0} projects
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={client.status} />
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {formatDate(client.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/clients/${client.id}`}
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {canManage && (
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Client"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {canArchive && client.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => setArchiveTarget(client)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Archive Client"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {data.pagination && (
            <Pagination
              meta={data.pagination}
              onPageChange={p => setPage(p)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="No clients found"
          description={
            search || statusFilter
              ? 'No client accounts match your active search or filter criteria.'
              : 'Get started by creating your first client account.'
          }
          actionText={canManage && !search && !statusFilter ? 'Add Client' : undefined}
          onAction={() => {
            setSelectedClient(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        client={selectedClient}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Client"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? Its associated projects and historical documents will remain intact.`}
        confirmText="Archive Client"
        isDestructive={true}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
};
