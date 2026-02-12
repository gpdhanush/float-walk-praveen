import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getLogoUrl } from '@/lib/utils/logoUtils';
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

export function SimpleSidebar() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const storeName = useSettingsStore(s => s.storeName);
  const logoUrl = useSettingsStore(s => s.logoUrl);
  const language = useSettingsStore(s => s.language);
  const { pathname } = useLocation();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;
  
  // Get full URL for logo
  const fullLogoUrl = getLogoUrl(logoUrl);
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="relative">
      <aside className="fixed left-0 top-0 z-[50] h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl">
        <div className="h-16 px-6 border-b border-sidebar-border flex items-center">
          <div className="flex items-center gap-3">
            {fullLogoUrl && !logoError ? (
              <div className="w-12 h-12 rounded-full bg-sidebar-primary flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-sidebar-border">
                <img 
                  src={fullLogoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: 'crisp-edges' }}
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-sidebar-primary flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-sidebar-border">
                <span className="text-xl font-bold text-sidebar-primary-foreground">
                  {storeName?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-display font-bold text-base text-sidebar-accent-foreground leading-tight">{storeName}</h1>
              <p className="text-xs text-sidebar-foreground/60">Billing System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(link => {
            const isActive = link.to === '/' 
              ? pathname === '/'
              : pathname.startsWith(link.to);
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm font-medium',
                  'rounded-md',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150'
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
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive w-full transition-colors"
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
