import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getLogoUrl } from '@/lib/utils/logoUtils';
import {
  LayoutDashboard, Users, FileText,
  Receipt, BarChart3, Settings, LogOut, Package, Globe, ChevronDown, ClipboardList, CalendarDays, Star, Images, ListChecks, Store, Clock3, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { ConfirmDialog } from '../shared/ConfirmDialog';

const adminLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/products', icon: Package, label: 'products' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
  { to: '/reports', icon: BarChart3, label: 'reports' },
  { to: '/settings', icon: Settings, label: 'settings' },
];

const employeeLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/products', icon: Package, label: 'products' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
];

export function SimpleSidebar({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const storeName = useSettingsStore(s => s.storeName);
  const logoUrl = useSettingsStore(s => s.logoUrl);
  const language = useSettingsStore(s => s.language);
  const { pathname } = useLocation();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [webExpanded, setWebExpanded] = useState(pathname.startsWith('/web'));
  
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;
  
  // Get full URL for logo
  const fullLogoUrl = getLogoUrl(logoUrl);
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="relative">
      <aside className={cn('fixed left-0 top-0 z-[50] h-screen bg-sidebar text-sidebar-foreground flex flex-col shadow-xl transition-[width] duration-200', collapsed ? 'w-20' : 'w-64')}>
        <div className={cn('h-16 border-b border-sidebar-border flex items-center', collapsed ? 'justify-center px-3' : 'px-6')}>
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
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
            <div className={collapsed ? 'hidden' : undefined}>
              <h1 className="font-display font-bold text-base text-sidebar-accent-foreground leading-tight">{storeName}</h1>
              <p className="text-xs text-sidebar-foreground/60">Billing System</p>
            </div>
          </div>
        </div>

        <nav className={cn('flex-1 space-y-1 overflow-y-auto', collapsed ? 'p-3' : 'p-4')}>
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
                  collapsed && 'justify-center px-2',
                  'rounded-[5px]',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150'
                )}
              >
                <link.icon className="w-4 h-4" />
                <span className={collapsed ? 'hidden' : undefined}>{t(link.label, language)}</span>
              </Link>
            );
          })}
          {user?.role === 'admin' && <div className="pt-2">
            <button onClick={() => setWebExpanded((value) => !value)} className={cn('flex items-center justify-between w-full gap-3 px-4 py-2.5 rounded-[5px] text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', collapsed && 'justify-center px-2')}>
              <span className="flex items-center gap-3"><Globe className="w-4 h-4" /><span className={collapsed ? 'hidden' : undefined}>Web</span></span><ChevronDown className={cn('w-4 h-4 transition-transform', webExpanded && 'rotate-180', collapsed && 'hidden')} />
            </button>
            {webExpanded && !collapsed && <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
              {[['enquiries', ClipboardList, 'Enquiries'], ['appointments', CalendarDays, 'Appointments'], ['testimonials', Star, 'Testimonials'], ['gallery', Images, 'Gallery'], ['services', ListChecks, 'Services'], ['store-status', Store, 'Store status'], ['hours', Clock3, 'Business hours']].map(([key, Icon, label]) => <Link key={String(key)} to={String(key) === 'store-status' || String(key) === 'hours' ? `/web-settings/${key}` : `/web/${key}`} className={cn('flex items-center gap-2 px-3 py-2 rounded-[5px] text-xs font-medium', pathname === `/web/${key}` || pathname === `/web-settings/${key}` ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}><Icon className="w-3.5 h-3.5" />{String(label)}</Link>)}
            </div>}
          </div>}
        </nav>

        <div className={cn('border-t border-sidebar-border', collapsed ? 'p-3' : 'p-4')}>
          <button onClick={() => onCollapsedChange(!collapsed)} className={cn('mb-2 flex items-center gap-3 px-4 py-2.5 rounded-[5px] text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full', collapsed && 'justify-center px-2')} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            <span className={collapsed ? 'hidden' : undefined}>Collapse</span>
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={cn('flex items-center gap-3 px-4 py-2.5 rounded-[5px] text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive w-full transition-colors', collapsed && 'justify-center px-2')}
          >
            <LogOut className="w-4 h-4" />
            <span className={collapsed ? 'hidden' : undefined}>{t('logout', language)}</span>
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
