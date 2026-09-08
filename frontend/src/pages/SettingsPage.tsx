import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Shield, Database, Server, Key, ShieldCheck, Mail } from 'lucide-react';
import { getRoleBadgeConfig, formatDate } from '../utils/formatters';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const roleBadge = getRoleBadgeConfig(role || 'MEMBER');

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account & System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          User profile details, role permissions overview, and environment configuration
        </p>
      </div>

      {/* Top Row: User Profile + System Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="xl" className="shadow-md ring-4 ring-slate-100" />
              <h3 className="text-base font-bold text-slate-900 mt-3">{user?.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </p>

              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {role} Access Tier
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 w-full text-left space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[150px]">{user?.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Member Since:</span>
                  <span className="font-medium text-slate-700">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System & Stack Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System & Stack Architecture</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Backend Engine</span>
                  <span className="text-slate-500 mt-0.5 block">Node.js Express TypeScript with centralized error handling and async safety.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Database & ORM</span>
                  <span className="text-slate-500 mt-0.5 block">Prisma ORM with 10 relational entities (SQLite local development, PostgreSQL-compatible).</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Security & Auth</span>
                  <span className="text-slate-500 mt-0.5 block">Dual-token JWT rotation (15m/7d), Bcrypt hashing, and HTTP-only cookie transport.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Frontend Framework</span>
                  <span className="text-slate-500 mt-0.5 block">React 18, Vite, TanStack Query, and Tailwind CSS design system.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RBAC Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Permissions Matrix (RBAC)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className={`p-5 rounded-2xl border transition-all ${role === 'ADMIN' ? 'border-brand-500 bg-brand-50/30 shadow-xs' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">ADMIN</span>
                {role === 'ADMIN' && (
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                    Your Current Role
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">Full organizational control and system administration privileges.</p>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li>Full organizational CRUD access</li>
                <li>Create and manage user accounts</li>
                <li>Archive clients and permanent deletion</li>
                <li>View complete organization audit log</li>
              </ul>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${role === 'MANAGER' ? 'border-brand-500 bg-brand-50/30 shadow-xs' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">MANAGER</span>
                {role === 'MANAGER' && (
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                    Your Current Role
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">Project leadership, client engagement, and team execution management.</p>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li>Create and update client organizations</li>
                <li>Initialize projects and set budgets</li>
                <li>Assign team members to project rosters</li>
                <li>Manage and reassign operational tasks</li>
              </ul>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${role === 'MEMBER' ? 'border-brand-500 bg-brand-50/30 shadow-xs' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider">MEMBER</span>
                {role === 'MEMBER' && (
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                    Your Current Role
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">Engineers, designers, and contributors executing tasks and deliverables.</p>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                <li>View permitted clients and projects</li>
                <li>Create and update tasks</li>
                <li>Change task status via Kanban board</li>
                <li>Upload and access project documents</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
