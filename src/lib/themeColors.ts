const materialColor = (light: string, dark: string) => ({
  light: { primary: light, primaryForeground: '0 0% 100%' },
  dark: { primary: dark, primaryForeground: '0 0% 100%' },
});

export const themeColors = {
  blue500: materialColor('217 91% 45%', '217 91% 60%'),
  red500: materialColor('0 74% 50%', '0 84% 62%'),
  pink500: materialColor('340 82% 52%', '340 82% 65%'),
  purple500: materialColor('270 70% 50%', '270 80% 65%'),
  deepPurple500: materialColor('255 65% 50%', '255 80% 66%'),
  indigo500: materialColor('231 65% 55%', '231 85% 68%'),
  cyan500: materialColor('192 75% 42%', '192 85% 58%'),
  teal500: materialColor('174 80% 36%', '174 75% 55%'),
  green500: materialColor('145 63% 42%', '145 70% 58%'),
  amber500: materialColor('38 92% 50%', '38 100% 62%'),
  orange500: materialColor('24 90% 50%', '24 95% 62%'),
  deepOrange500: materialColor('14 85% 50%', '14 95% 64%'),
};

export function applyThemeColor(color: string, theme: 'light' | 'dark') {
  const colors = themeColors[color as keyof typeof themeColors];
  if (!colors) return;

  const selectedColors = theme === 'dark' ? colors.dark : colors.light;
  const root = document.documentElement;

  // Update primary colors
  root.style.setProperty('--primary', selectedColors.primary);
  root.style.setProperty('--primary-foreground', selectedColors.primaryForeground);
  root.style.setProperty('--accent', selectedColors.primary);
  root.style.setProperty('--accent-foreground', selectedColors.primaryForeground);
  
  // Update sidebar primary colors to match
  root.style.setProperty('--sidebar-primary', selectedColors.primary);
  root.style.setProperty('--sidebar-primary-foreground', selectedColors.primaryForeground);
  
  // Update ring colors to match
  root.style.setProperty('--ring', selectedColors.primary);
  root.style.setProperty('--sidebar-ring', selectedColors.primary);
}

export const themeColorOptions = [
  { name: 'Blue 500', value: 'blue500', color: 'bg-blue-500' },
  { name: 'Red 500', value: 'red500', color: 'bg-red-500' },
  { name: 'Pink 500', value: 'pink500', color: 'bg-pink-500' },
  { name: 'Purple 500', value: 'purple500', color: 'bg-purple-500' },
  { name: 'Deep Purple 500', value: 'deepPurple500', color: 'bg-violet-500' },
  { name: 'Indigo 500', value: 'indigo500', color: 'bg-indigo-500' },
  { name: 'Cyan 500', value: 'cyan500', color: 'bg-cyan-500' },
  { name: 'Teal 500', value: 'teal500', color: 'bg-teal-500' },
  { name: 'Green 500', value: 'green500', color: 'bg-green-500' },
  { name: 'Amber 500', value: 'amber500', color: 'bg-amber-500' },
  { name: 'Orange 500', value: 'orange500', color: 'bg-orange-500' },
  { name: 'Deep Orange 500', value: 'deepOrange500', color: 'bg-orange-600' },
];
