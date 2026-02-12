// Theme color system - applies CSS variables based on selected color
export const themeColors = {
  blue: {
    light: {
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '210 40% 98%',
    },
    dark: {
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '222.2 47.4% 11.2%',
    }
  },
  purple: {
    light: {
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '210 40% 98%',
    },
    dark: {
      primary: '263.4 70% 50.4%',
      primaryForeground: '210 40% 98%',
    }
  },
  green: {
    light: {
      primary: '142.1 76.2% 36.3%',
      primaryForeground: '355.7 100% 97.3%',
    },
    dark: {
      primary: '142.1 70.6% 45.3%',
      primaryForeground: '144.9 80.4% 10%',
    }
  },
  orange: {
    light: {
      primary: '24.6 95% 53.1%',
      primaryForeground: '60 9.1% 97.8%',
    },
    dark: {
      primary: '20.5 90.2% 48.2%',
      primaryForeground: '60 9.1% 97.8%',
    }
  },
  red: {
    light: {
      primary: '0 72.2% 50.6%',
      primaryForeground: '0 85.7% 97.3%',
    },
    dark: {
      primary: '0 62.8% 30.6%',
      primaryForeground: '0 85.7% 97.3%',
    }
  },
  pink: {
    light: {
      primary: '330.4 81.2% 60.4%',
      primaryForeground: '210 40% 98%',
    },
    dark: {
      primary: '330.4 81.2% 60.4%',
      primaryForeground: '346.8 77.2% 12.2%',
    }
  }
};

export function applyThemeColor(color: string, theme: 'light' | 'dark') {
  const colors = themeColors[color as keyof typeof themeColors];
  if (!colors) return;

  const selectedColors = theme === 'dark' ? colors.dark : colors.light;
  const root = document.documentElement;

  // Update primary colors
  root.style.setProperty('--primary', selectedColors.primary);
  root.style.setProperty('--primary-foreground', selectedColors.primaryForeground);
  
  // Update sidebar primary colors to match
  root.style.setProperty('--sidebar-primary', selectedColors.primary);
  root.style.setProperty('--sidebar-primary-foreground', selectedColors.primaryForeground);
  
  // Update ring colors to match
  root.style.setProperty('--ring', selectedColors.primary);
  root.style.setProperty('--sidebar-ring', selectedColors.primary);
}

export const themeColorOptions = [
  { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
  { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
  { name: 'Green', value: 'green', color: 'bg-green-500' },
  { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
  { name: 'Red', value: 'red', color: 'bg-red-500' },
  { name: 'Pink', value: 'pink', color: 'bg-pink-500' },
];
