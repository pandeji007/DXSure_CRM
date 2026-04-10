import { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import { cn } from '../../lib/utils';

export default function Header({ onMenuClick }) {
  const { profile } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            searchFocused ? 'text-primary' : 'text-text-muted'
          )} />
          <input
            type="text"
            placeholder="Search anything..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "w-64 bg-elevated border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary",
              "placeholder:text-text-muted transition-all duration-200",
              "focus:border-primary focus:shadow-[0_0_0_3px_rgba(108,99,255,0.13)] focus:w-80"
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar name={profile?.name} src={profile?.avatar_url} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary leading-tight">
              {profile?.name || 'User'}
            </p>
            <p className="text-xs text-text-muted capitalize">
              {profile?.role || 'employee'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
