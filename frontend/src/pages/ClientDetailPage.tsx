import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '../services/clients.service';
import { documentsService } from '../services/documents.service';
import { projectsService } from '../services/projects.service';
import { activitiesService } from '../services/activities.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Users,
  FileText,
  History,
  Plus,
  Edit2,
  Trash2,
  Download,
  ArrowLeft
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ClientModal } from '../components/clients/ClientModal';
import { ContactModal } from '../components/clients/ContactModal';
import { ProjectModal } from '../components/projects/ProjectModal';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate, formatRelativeTime, formatBytes, formatCurrency } from '../utils/formatters';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'projects' | 'documents' | 'activity'>('overview');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const canManage = role === 'ADMIN' || role === 'MANAGER';

  const {
    data: client,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsService.getClient(id!),
    enabled: !!id
  });

  const { data: clientActivities } = useQuery({
    queryKey: ['client-activities', id],
    queryFn: () => activitiesService.getActivities({ clientId: id, limit: 20 }),
    enabled: !!id && activeTab === 'activity'
  });

  const updateClientMutation = useMutation({
    mutationFn: (data: any) => clientsService.updateClient(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      success('Client updated successfully');
    },
    onError: (err: any) => toastError(err.message || 'Update failed')
  });

  const addContactMutation = useMutation({
    mutationFn: (data: any) => clientsService.addContact(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      success('Contact added successfully');
    },
    onError: (err: any) => toastError(err.message || 'Failed to add contact')
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => clientsService.deleteContact(id!, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      success('Contact removed');
      setDeleteContactId(null);
    },
    onError: (err: any) => toastError(err.message || 'Failed to remove contact')
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => projectsService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      success('Project initialized');
    },
    onError: (err: any) => toastError(err.message || 'Failed to create project')
  });

  const uploadDocMutation = useMutation({
    mutationFn: (formData: FormData) => documentsService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Document uploaded');
    },
    onError: (err: any) => toastError(err.message || 'Upload failed')
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !client) {
    return <ErrorState message="Could not load client details." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/clients')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Clients
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0 shadow-2xs">
            {client.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
              <StatusBadge status={client.status} />
            </div>
            {client.company && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{client.company}</p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-brand-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.email}</span>
                </a>
              )}
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.phone}</span>
                </span>
              )}
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-brand-600"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit Details
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProjectModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Project
            </Button>
            <Button
              size="sm"
              onClick={() => setIsDocModalOpen(true)}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              Upload Doc
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview', icon: Building2 },
          { id: 'contacts', label: `Contacts (${client.contacts?.length || 0})`, icon: Users },
          { id: 'projects', label: `Projects (${client.projects?.length || 0})`, icon: Briefcase },
          { id: 'documents', label: `Documents (${client.documents?.length || 0})`, icon: FileText },
          { id: 'activity', label: 'Activity Log', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 border-b-2 transition -mb-[1px] ${
                isActive
                  ? 'border-brand-600 text-brand-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Overview & Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Internal Account Notes
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {client.notes || 'No internal notes recorded for this client.'}
                </p>
              </div>

              {client.address && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Headquarters / Address
                  </span>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span>{client.address}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500">Active Projects</span>
                <span className="text-sm font-bold text-slate-900">{client._count?.projects || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500">Total Contacts</span>
                <span className="text-sm font-bold text-slate-900">{client._count?.contacts || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs text-slate-500">Documents Vault</span>
                <span className="text-sm font-bold text-slate-900">{client._count?.documents || 0} files</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Account Created</span>
                <span className="text-xs font-semibold text-slate-700">{formatDate(client.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Stakeholder Directory</h3>
            {canManage && (
              <Button
                size="sm"
                onClick={() => setIsContactModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Contact
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {client.contacts && client.contacts.length > 0 ? (
              client.contacts.map(contact => (
                <Card key={contact.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">{contact.name}</h4>
                          {contact.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                              Primary
                            </span>
                          )}
                        </div>
                        {contact.title && (
                          <p className="text-xs text-slate-500 mt-0.5">{contact.title}</p>
                        )}
                      </div>

                      {canManage && (
                        <button
                          onClick={() => setDeleteContactId(contact.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${contact.email}`} className="hover:text-brand-600 truncate">
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                No contacts listed for this client.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Projects under {client.name}</h3>
            {canManage && (
              <Button
                size="sm"
                onClick={() => setIsProjectModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Project
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {client.projects && client.projects.length > 0 ? (
              client.projects.map(proj => (
                <Card key={proj.id} className="hover:border-brand-300 transition">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/projects/${proj.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition"
                      >
                        {proj.name}
                      </Link>
                      <StatusBadge status={proj.status} />
                    </div>

                    {proj.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <PriorityBadge priority={proj.priority} className="text-[10px] py-0 px-2" />
                        <span>{proj._count?.tasks || 0} tasks</span>
                      </div>
                      {proj.budget && (
                        <span className="font-semibold text-slate-900">{formatCurrency(proj.budget)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                No active projects under this client.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Client Document Repository</h3>
            <Button
              size="sm"
              onClick={() => setIsDocModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Upload Document
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {client.documents && client.documents.length > 0 ? (
              client.documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{doc.fileName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(doc.fileSize)} • Uploaded {formatRelativeTime(doc.createdAt)} by{' '}
                        {doc.uploadedBy?.name || 'Team member'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={documentsService.getDownloadUrl(doc.id)}
                    download
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No documents uploaded for this client.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Client Audit Trail</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {clientActivities?.data && clientActivities.data.length > 0 ? (
              <div className="space-y-4">
                {clientActivities.data.map(act => (
                  <div key={act.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-3 last:border-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800">
                        <span className="font-semibold text-slate-900">{act.actor?.name || 'System'}</span>{' '}
                        {act.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDate(act.createdAt, 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">No activity logged for this client</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async data => {
          await updateClientMutation.mutateAsync(data);
        }}
        client={client}
        isLoading={updateClientMutation.isPending}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={async data => {
          await addContactMutation.mutateAsync(data);
        }}
        isLoading={addContactMutation.isPending}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={async data => {
          await createProjectMutation.mutateAsync(data);
        }}
        clients={[client]}
        defaultClientId={client.id}
        isLoading={createProjectMutation.isPending}
      />

      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmit={async data => {
          await uploadDocMutation.mutateAsync(data);
        }}
        clients={[client]}
        defaultClientId={client.id}
        isLoading={uploadDocMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteContactId}
        onClose={() => setDeleteContactId(null)}
        onConfirm={() => deleteContactMutation.mutate(deleteContactId!)}
        title="Remove Contact"
        message="Are you sure you want to remove this contact from this client account?"
        confirmText="Remove Contact"
        isDestructive={true}
        isLoading={deleteContactMutation.isPending}
      />
    </div>
  );
};
