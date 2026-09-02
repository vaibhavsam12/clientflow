import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '../services/documents.service';
import { clientsService } from '../services/clients.service';
import { projectsService } from '../services/projects.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Document, Client, Project } from '../types';
import {
  FileText,
  UploadCloud,
  Search,
  Download,
  Trash2,
  FileSpreadsheet,
  FileCode,
  Image,
  File
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate, formatBytes } from '../utils/formatters';

export const DocumentsPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [clientIdFilter, setClientIdFilter] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  const canManage = role === 'ADMIN' || role === 'MANAGER';

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['documents', page, search, clientIdFilter, projectIdFilter],
    queryFn: () =>
      documentsService.getDocuments({
        page,
        limit: 15,
        search: search || undefined,
        clientId: clientIdFilter || undefined,
        projectId: projectIdFilter || undefined
      })
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients-lookup'],
    queryFn: () => clientsService.getClients({ limit: 100 })
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-lookup'],
    queryFn: () => projectsService.getProjects({ limit: 100 })
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentsService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Document uploaded successfully!');
    },
    onError: (err: any) => toastError(err.message || 'Upload failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Document deleted');
      setDeleteTarget(null);
    },
    onError: (err: any) => toastError(err.message || 'Failed to delete document')
  });

  const getFileIcon = (mime: string) => {
    if (mime.includes('pdf')) return <FileText className="w-4 h-4 text-rose-500" />;
    if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    if (mime.includes('image')) return <Image className="w-4 h-4 text-purple-500" />;
    if (mime.includes('word') || mime.includes('text')) return <FileCode className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Document Vault</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository for architectural blueprints, contracts, and deliverables
          </p>
        </div>

        <Button
          onClick={() => setIsUploadModalOpen(true)}
          leftIcon={<UploadCloud className="w-4 h-4" />}
          size="md"
        >
          Upload Document
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <select
            value={clientIdFilter}
            onChange={e => {
              setClientIdFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Clients</option>
            {clientsData?.data.map((c: Client) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={projectIdFilter}
            onChange={e => {
              setProjectIdFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Projects</option>
            {projectsData?.data.map((p: Project) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      {error ? (
        <ErrorState message="Could not load documents." onRetry={refetch} />
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
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Associated Client</TableHead>
                <TableHead>Associated Project</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((doc: Document) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {getFileIcon(doc.mimeType)}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 max-w-xs truncate">
                        {doc.fileName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">
                    {formatBytes(doc.fileSize)}
                  </TableCell>

                  <TableCell>
                    {doc.client ? (
                      <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {doc.client.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {doc.project ? (
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {doc.project.name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-700">
                    {doc.uploadedBy?.name || 'Member'}
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {formatDate(doc.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={documentsService.getDownloadUrl(doc.id)}
                        download
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {canManage && (
                        <button
                          onClick={() => setDeleteTarget(doc)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.pagination && (
            <Pagination
              meta={data.pagination}
              onPageChange={(p: number) => setPage(p)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No documents uploaded"
          description={
            search || clientIdFilter || projectIdFilter
              ? 'No documents match your search filters.'
              : 'Upload technical specifications, architectural diagrams, or deliverables.'
          }
          actionText="Upload Document"
          onAction={() => setIsUploadModalOpen(true)}
        />
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={async formData => {
          await uploadMutation.mutateAsync(formData);
        }}
        clients={clientsData?.data || []}
        projects={projectsData?.data || []}
        isLoading={uploadMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget!.id)}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.fileName}"? This cannot be undone.`}
        confirmText="Delete File"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
