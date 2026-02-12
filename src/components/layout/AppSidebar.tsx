import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Package, FileText, ShoppingCart,
  Receipt, BarChart3, Settings, Footprints, LogOut
} from 'lucide-react';

const adminLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/measurements', icon: Footprints, label: 'measurements' },
  { to: '/products', icon: Package, label: 'products' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/purchases', icon: ShoppingCart, label: 'purchases' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
  { to: '/reports', icon: BarChart3, label: 'reports' },
  { to: '/settings', icon: Settings, label: 'settings' },
];

const employeeLinks = [
  { to: '/', icon: LayoutDashboard, label: 'dashboard' },
  { to: '/customers', icon: Users, label: 'customers' },
  { to: '/measurements', icon: Footprints, label: 'measurements' },
  { to: '/invoices', icon: FileText, label: 'invoices' },
  { to: '/expenses', icon: Receipt, label: 'expenses' },
];

export function AppSidebar() {
  const { user, logout } = useAuthStore();
  const { language, storeName } = useSettingsStore();
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Footprints className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-sidebar-accent-foreground">{storeName}</h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <link.icon className="w-4 h-4" />
            {t(link.label, language)}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('logout', language)}
        </button>
      </div>
    </aside>
  );
}
