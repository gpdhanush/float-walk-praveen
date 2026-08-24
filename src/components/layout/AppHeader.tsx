import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEffect, useState } from 'react';
import { Moon, Sun, Maximize, Minimize, Palette, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { applyThemeColor, themeColorOptions } from '@/lib/themeColors';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function AppHeader({ collapsed, onToggleSidebar }: { collapsed: boolean; onToggleSidebar: () => void }) {
  // Optimize store subscriptions
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const theme = useSettingsStore(s => s.theme);
  const setTheme = useSettingsStore(s => s.setTheme);
  const themeColor = useSettingsStore(s => s.themeColor);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const logoUrl = useSettingsStore(s => s.logoUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  const handleThemeColorChange = async (color: string) => {
    try {
      // Apply color immediately
      applyThemeColor(color, theme);
      // Save to database
      await updateSettings({ themeColor: color });
    } catch (error) {
      console.error('Failed to update theme color:', error);
    }
  };

  return (
    <header className="sticky top-3 z-30 mx-3 flex h-14 items-center justify-between rounded-2xl border border-slate-400/70 bg-white/70 px-5 text-foreground shadow-[0_16px_45px_-28px_rgba(15,23,42,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 dark:text-sidebar-foreground">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-foreground hover:bg-muted hover:text-foreground dark:text-sidebar-foreground dark:hover:bg-sidebar-accent dark:hover:text-sidebar-foreground"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
        <h3>Float Walk Admin Panel</h3>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="text-foreground hover:text-foreground hover:bg-muted dark:text-sidebar-foreground dark:hover:text-sidebar-foreground dark:hover:bg-sidebar-accent"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-foreground hover:text-foreground hover:bg-muted dark:text-sidebar-foreground dark:hover:text-sidebar-foreground dark:hover:bg-sidebar-accent"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
        
        {/* Theme Color Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-foreground hover:bg-muted dark:text-sidebar-foreground dark:hover:text-sidebar-foreground dark:hover:bg-sidebar-accent"
            >
              <Palette className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {themeColorOptions.map((color) => (
              <DropdownMenuItem
                key={color.value}
                onClick={() => handleThemeColorChange(color.value)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{color.name}</span>
                <div className={`w-4 h-4 rounded-full ${color.color} ${themeColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Info */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-2 flex items-center gap-2 rounded-[5px] px-2 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10" aria-label="Open profile menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block">
                <span className="block text-sm font-medium text-foreground leading-tight dark:text-sidebar-foreground">{user?.name || 'User'}</span>
                <span className="block text-xs text-muted-foreground capitalize leading-tight dark:text-sidebar-foreground/60">{user?.role || 'User'}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-none">
            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => setShowLogoutConfirm(true)}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ConfirmDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm} onConfirm={logout} title="Logout" description="Are you sure you want to logout?" confirmLabel="Logout" variant="destructive" />
    </header>
  );
}
