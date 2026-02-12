import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useDataStore } from "@/stores/dataStore";
import { useEffect, useRef, startTransition, lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ApiLoader } from "@/components/ApiLoader";
import Login from "@/pages/Login";
import { PerformanceMonitor } from "@/utils/performanceMonitor";
import { applyThemeColor } from "@/lib/themeColors";

// Lazy load pages for faster navigation
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerForm = lazy(() => import("@/pages/CustomerForm"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const InvoiceForm = lazy(() => import("@/pages/InvoiceForm"));
const InvoiceView = lazy(() => import("@/pages/InvoiceView"));
const InvoicePrint = lazy(() => import("@/pages/InvoicePrint"));
const Expenses = lazy(() => import("@/pages/Expenses"));
const Reports = lazy(() => import("@/pages/Reports"));
const Settings = lazy(() => import("@/pages/SettingsNew"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function AppContent() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const theme = useSettingsStore(s => s.theme);
  const themeColor = useSettingsStore(s => s.themeColor);
  const fetchSettings = useSettingsStore(s => s.fetchSettings);
  const isLoaded = useSettingsStore(s => s.isLoaded);
  const fetchData = useDataStore(s => s.fetchData);
  const dataFetched = useDataStore(s => s.dataFetched);
  const hasFetchedRef = useRef(false);
  const hasSettingsFetchedRef = useRef(false);

  // Fetch settings when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoaded && !hasSettingsFetchedRef.current) {
      hasSettingsFetchedRef.current = true;
      console.log('User authenticated, fetching settings...');
      
      // Delay to ensure token is persisted to localStorage
      setTimeout(() => {
        startTransition(() => {
          fetchSettings().catch(err => {
            console.error('Failed to fetch settings after login:', err);
            // Reset flag so it can retry on next render
            hasSettingsFetchedRef.current = false;
          });
        });
      }, 300);
    }
  }, [isAuthenticated, isLoaded, fetchSettings]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && !dataFetched && !hasFetchedRef.current) {
        hasFetchedRef.current = true;
        // Use startTransition to avoid blocking UI updates
        startTransition(() => {
          fetchData();
        });
    }
  }, [isAuthenticated, dataFetched, fetchData]);

  // Apply theme (dark/light mode)
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Apply theme color
  useEffect(() => {
    applyThemeColor(themeColor, theme);
  }, [themeColor, theme]);

  if (!isAuthenticated) return <Login />;

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<InvoiceForm />} />
          <Route path="/invoices/edit/:id" element={<InvoiceForm />} />
          <Route path="/invoice/:id" element={<InvoiceView />} />
          <Route path="/expenses" element={<Expenses />} />
          {user?.role === 'admin' && (
            <>
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </>
          )}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/invoice/print/:id" element={<InvoicePrint />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ApiLoader />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
