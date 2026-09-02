import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { Project, Client } from '../../types';
import { formatBytes } from '../../utils/formatters';

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  clients?: Client[];
  projects?: Project[];
  defaultClientId?: string;
  defaultProjectId?: string;
  isLoading?: boolean;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clients = [],
  projects = [],
  defaultClientId,
  defaultProjectId,
  isLoading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState<string>(defaultClientId || '');
  const [projectId, setProjectId] = useState<string>(defaultProjectId || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (clientId) formData.append('clientId', clientId);
    if (projectId) formData.append('projectId', projectId);

    await onSubmit(formData);
    setSelectedFile(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      description="Attach project specifications, architecture documents, or contracts"
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Drag and Drop Box */}
        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-500 transition cursor-pointer bg-slate-50/50">
          <input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <File className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Click to browse or drag file here</p>
              <p className="text-[10px] text-slate-400 mt-1">PDF, DOCX, XLSX, TXT, CSV, PNG, JPG (up to 10MB)</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Associate with Client"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          >
            <option value="">None (Organization Wide)</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="Associate with Project"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
          >
            <option value="">None</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!selectedFile}>
            Upload File
          </Button>
        </div>
      </form>
    </Modal>
  );
};
