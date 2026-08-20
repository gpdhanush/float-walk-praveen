import { SimpleSidebar } from './SimpleSidebar';
import { AppHeader } from './AppHeader';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-shell min-h-screen bg-background">
      <SimpleSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <div className={sidebarCollapsed ? 'ml-20' : 'ml-64'}>
        <AppHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
