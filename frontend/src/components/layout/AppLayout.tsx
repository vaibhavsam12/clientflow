import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  CheckSquare,
  Users,
  FileText,
  History,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { getRoleBadgeConfig } from '../../utils/formatters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../../services/notifications.service';
import { formatRelativeTime } from '../../utils/formatters';

export const AppLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (notificationOpen) {
          setNotificationOpen(false);
          notifButtonRef.current?.focus();
        }
        if (userDropdownOpen) {
          setUserDropdownOpen(false);
          userButtonRef.current?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileMenuButtonRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notificationOpen, userDropdownOpen, mobileMenuOpen]);

  // Unread notifications query
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000 // Polling every 30s
  });

  const { data: recentNotifications } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: () => notificationsService.getNotifications({ limit: 5 }),
    enabled: notificationOpen
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
    }
  });

  const markSingleReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
    }
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/clients', label: 'Clients', icon: Building2 },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/users', label: 'Team', icon: Users },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/activities', label: 'Activity Log', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const roleBadge = getRoleBadgeConfig(role || 'MEMBER');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* WCAG 2.1 AA: Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm"
      >
        Skip to main content
      </a>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        id="app-sidebar"
        aria-label="Sidebar navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-600/30" aria-hidden="true">
              CF
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">CLIENTFLOW</span>
              <span className="block text-[10px] uppercase font-semibold text-brand-400 tracking-wider">Operations</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links with accessible list markup */}
        <nav aria-label="Main Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand-400 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-medium rounded bg-slate-700 text-slate-300">
                {role}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out of your account"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <header role="banner" className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="app-sidebar"
              className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500">
              <span>ClientFlow</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" aria-hidden="true" />
              <span className="capitalize font-semibold text-slate-900" aria-current="location">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Area */}
            <div className="relative">
              <button
                ref={notifButtonRef}
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-haspopup="dialog"
                aria-expanded={notificationOpen}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    <span className="sr-only">Unread notifications: </span>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dialog */}
              {notificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="dialog"
                    aria-label="Recent notifications"
                    aria-modal="true"
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-scale-up"
                  >
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllReadMutation.mutate()}
                          disabled={markAllReadMutation.isPending}
                          className="text-xs text-brand-600 hover:text-brand-800 font-medium transition focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {recentNotifications?.data && recentNotifications.data.length > 0 ? (
                        recentNotifications.data.map(notif => (
                          <div
                            key={notif.id}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                if (!notif.isRead) markSingleReadMutation.mutate(notif.id);
                                if (notif.link) {
                                  setNotificationOpen(false);
                                  navigate(notif.link);
                                }
                              }
                            }}
                            onClick={() => {
                              if (!notif.isRead) markSingleReadMutation.mutate(notif.id);
                              if (notif.link) {
                                setNotificationOpen(false);
                                navigate(notif.link);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 focus-visible:ring-2 focus-visible:ring-brand-500 ${
                              !notif.isRead ? 'bg-indigo-50/40' : ''
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.isRead ? 'bg-brand-600' : 'bg-transparent'}`} aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">{notif.title}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-500">
                          No recent notifications
                        </div>
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                      <NavLink
                        to="/notifications"
                        onClick={() => setNotificationOpen(false)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800 focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1"
                      >
                        View all notifications
                      </NavLink>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                ref={userButtonRef}
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="User account menu"
                aria-haspopup="menu"
                aria-expanded={userDropdownOpen}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</div>
                  <div className="text-[10px] text-slate-500">{user?.email}</div>
                </div>
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} aria-hidden="true" />
                  <div
                    role="menu"
                    aria-label="User options"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-scale-up"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                          {role}
                        </span>
                      </div>
                    </div>

                    <NavLink
                      to="/settings"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      Account Settings
                    </NavLink>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body with proper Landmark and ID for Skip Link */}
        <main id="main-content" tabIndex={-1} role="main" aria-label="Main content" className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
