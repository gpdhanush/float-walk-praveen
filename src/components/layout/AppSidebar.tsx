import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, FileText,
  Receipt, BarChart3, Settings, LogOut
} from 'lucide-react';
import { ConfirmDialog } from '../shared/ConfirmDialog';

const adminLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
  { to: '/reports', icon: BarChart3, label: 'reports' },
  { to: '/settings', icon: Settings, label: 'settings' },
];

const employeeLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
];

export function AppSidebar() {
  // Optimize store subscriptions - only subscribe to needed values
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const storeName = useSettingsStore(s => s.storeName);
  const language = useSettingsStore(s => s.language);
  const location = useLocation();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <div className="relative">
      <aside className="fixed left-0 top-0 z-[50] h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl">
        <div className="p-6 border-b border-sidebar-border">
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-accent-foreground">{storeName}</h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize mt-1">{user?.role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(link => {
            const isActive = link.to === '/' 
              ? location.pathname === '/'
              : location.pathname.startsWith(link.to);
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:transition-colors hover:duration-150'
                )}
              >
                <link.icon className="w-4 h-4" />
                {t(link.label, language)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('logout', language)}
          </button>
        </div>
      </aside>

      <ConfirmDialog 
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={logout}
        title={t('logout', language)}
        description="Are you sure you want to logout?"
        confirmLabel={t('logout', language)}
        variant="destructive"
      />
    </div>
  );
}
