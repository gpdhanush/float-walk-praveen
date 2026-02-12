import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Moon, Sun, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { applyThemeColor, themeColorOptions } from '@/lib/themeColors';

export function AppHeader() {
  // Optimize store subscriptions
  const user = useAuthStore(s => s.user);
  const theme = useSettingsStore(s => s.theme);
  const setTheme = useSettingsStore(s => s.setTheme);
  const themeColor = useSettingsStore(s => s.themeColor);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  const logoUrl = useSettingsStore(s => s.logoUrl);

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
    <header className="h-16 border-b border-sidebar-border bg-sidebar backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="gap-2 text-xs font-medium text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Globe className="w-4 h-4" />
          {language === 'en' ? 'தமிழ்' : 'EN'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
        
        {/* Theme Color Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
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
        <div className="flex items-center gap-2 ml-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-sidebar-foreground leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-sidebar-foreground/60 capitalize leading-tight">
              {user?.role || 'User'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
