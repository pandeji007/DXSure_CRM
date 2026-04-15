import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Target,
  PhoneCall,
  Ticket,
  CalendarDays,
  DollarSign,
  Store,
  UserCog,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { cn } from '../../lib/utils';

const adminNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/leads', icon: Target, label: 'Leads' },
  { to: '/follow-ups', icon: PhoneCall, label: 'Follow-Ups' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/day-plans', icon: CalendarDays, label: 'Day Plans' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/vendors', icon: Store, label: 'Vendors' },
  { to: '/employees', icon: UserCog, label: 'Employees' },
  { to: '/activity', icon: Activity, label: 'Activity Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const employeeNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/leads', icon: Target, label: 'Leads' },
  { to: '/follow-ups', icon: PhoneCall, label: 'Follow-Ups' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/day-plans', icon: CalendarDays, label: 'Day Plans' },
  { to: '/finance', icon: Wallet, label: 'Petty Cash' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { profile, isAdmin, logout } = useAuth();
  const navItems = isAdmin ? adminNav : employeeNav;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen bg-surface border-r border-border flex flex-col sticky top-0 z-30 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">DX</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-semibold text-text-primary whitespace-nowrap overflow-hidden text-lg tracking-tight"
            >
              DXSure <span className="text-primary">CRM</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          );

          return collapsed ? (
            <Tooltip key={item.to} content={item.label} side="right">
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-border p-3 space-y-2 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <Avatar
            name={profile?.name}
            src={profile?.avatar_url}
            size="sm"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium text-text-primary truncate">
                  {profile?.name || 'User'}
                </p>
                <p className="text-xs text-text-muted truncate capitalize">
                  {profile?.role || 'employee'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => logout()}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2 text-sm text-text-muted hover:text-danger hover:bg-danger/10 transition-colors',
              collapsed ? 'w-full px-2' : 'flex-1 px-3'
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
