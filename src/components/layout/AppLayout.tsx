import { SimpleSidebar } from './SimpleSidebar';
import { AppHeader } from './AppHeader';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <SimpleSidebar />
      <div className="ml-64">
        <AppHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
