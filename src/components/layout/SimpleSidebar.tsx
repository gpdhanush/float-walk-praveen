import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getLogoUrl } from '@/lib/utils/logoUtils';
import {
  LayoutDashboard, Users, FileText,
  Receipt, BarChart3, Settings, Package, ClipboardList, CalendarDays, Star, Images, ListChecks, Store
} from 'lucide-react';

const adminLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/products', icon: Package, label: 'products' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
  { to: '/reports', icon: BarChart3, label: 'reports' },
  { to: '/settings', icon: Settings, label: 'settings' },
];

const employeeLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/products', icon: Package, label: 'products' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
];

const webLinks = [
  { to: '/web/enquiries', icon: ClipboardList, label: 'Enquiries' },
  { to: '/web/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/web/testimonials', icon: Star, label: 'Testimonials' },
  { to: '/web/gallery', icon: Images, label: 'Gallery' },
  { to: '/web/services', icon: ListChecks, label: 'Services' },
  { to: '/web-settings/store-status', icon: Store, label: 'Store status' },
];

export function SimpleSidebar({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
  const user = useAuthStore(s => s.user);
  const storeName = useSettingsStore(s => s.storeName);
  const logoUrl = useSettingsStore(s => s.logoUrl);
  const language = useSettingsStore(s => s.language);
  const { pathname } = useLocation();
  
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;
  
  // Get full URL for logo
  const fullLogoUrl = getLogoUrl(logoUrl);
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="relative">
      <aside className={cn('sidebar-sora fixed left-3 top-3 z-[50] h-[calc(100vh-1.5rem)] bg-white/70 text-foreground flex flex-col rounded-3xl border border-white/70 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition-[width] duration-200 dark:border-white/10 dark:bg-slate-950/65 dark:text-sidebar-foreground', collapsed ? 'w-20' : 'w-64')}>
        <div className={cn('relative h-16 border-b border-black/5 flex items-center dark:border-white/10', collapsed ? 'justify-center px-3' : 'px-4')}>
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
            <div className={cn('min-w-0 flex-1', collapsed && 'hidden')}>
              <h1 className="truncate font-display font-bold text-base text-foreground leading-tight dark:text-sidebar-accent-foreground">{storeName}</h1>
              {/* <p className="text-xs text-muted-foreground dark:text-sidebar-foreground/60">FloatWalk Admin</p> */}
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
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground transition-colors duration-150 dark:text-sidebar-foreground/70 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'
                )}
              >
                <link.icon className="w-4 h-4" />
                <span className={collapsed ? 'hidden' : undefined}>{t(link.label, language)}</span>
              </Link>
            );
          })}
          {user?.role === 'admin' && <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/10">
            {!collapsed && <div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground dark:text-sidebar-foreground/50">Web</div>}
            {webLinks.map((link) => {
              const isActive = pathname === link.to;
              return <Link key={link.to} to={link.to} className={cn('flex items-center gap-3 rounded-[5px] px-4 py-2.5 text-sm font-medium transition-colors', collapsed && 'justify-center px-2', isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-foreground/70 hover:bg-black/5 hover:text-foreground dark:text-sidebar-foreground/70 dark:hover:bg-white/10 dark:hover:text-sidebar-accent-foreground')}><link.icon className="w-4 h-4" /><span className={collapsed ? 'hidden' : undefined}>{link.label}</span></Link>;
            })}
          </div>}
        </nav>

      </aside>
    </div>
  );
}
