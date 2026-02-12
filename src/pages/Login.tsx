import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footprints, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const { language } = useSettingsStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const ok = await login(email, password);
    if (!ok) {
      setError('Invalid credentials');
    } else {
      setError('');
      // Redirect to dashboard after successful login
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Float Walk Logo" 
              className="w-full h-full object-contain p-2"
            />
          </div>
          <CardTitle className="font-display text-2xl">Float Walk</CardTitle>
          <CardDescription>Retail Billing System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('email', language)}</Label>
              <Input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                type="email" 
                placeholder="Email" 
                autoComplete="email" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>{t('password', language)}</Label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">{t('login', language)}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
