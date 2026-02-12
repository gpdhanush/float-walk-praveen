import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footprints, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const { language } = useSettingsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (!ok) setError('Invalid credentials');
    else setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Footprints className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">FootWear Pro</CardTitle>
          <CardDescription>Retail Billing System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('username', language)}</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
            </div>
            <div className="space-y-2">
              <Label>{t('password', language)}</Label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">{t('login', language)}</Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Demo: admin/admin123 or employee/emp123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
