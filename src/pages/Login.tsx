import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footprints, Eye, EyeOff, Check, Lock } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { t } from '@/lib/i18n';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { language } = useSettingsStore();
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('floatwalk_remembered_email');
    const wasRemembered = localStorage.getItem('floatwalk_remember_me') === 'true';
    if (savedEmail && wasRemembered) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const nextFieldErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextFieldErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextFieldErrors.email = 'Enter a valid email address';
    if (!password) nextFieldErrors.password = 'Password is required';
    setFieldErrors(nextFieldErrors);
    setIsLoading(true);

    if (nextFieldErrors.email || nextFieldErrors.password) {
      setIsLoading(false);
      return;
    }

    try {
      const ok = await login(email, password);
      if (!ok) {
        setError('Invalid email or password');
      } else {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('floatwalk_remembered_email', email);
          localStorage.setItem('floatwalk_remember_me', 'true');
        } else {
          localStorage.removeItem('floatwalk_remembered_email');
          localStorage.removeItem('floatwalk_remember_me');
        }
        setError('');
        navigate('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-slate-950/95 relative z-10 rounded-[20px]">
        <CardHeader className="text-center pb-6 space-y-4">
          {/* Logo Container with enhanced styling */}
          <div className="mx-auto w-24 h-24 rounded-[20px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shadow-lg">
            <div className="w-20 h-20 rounded-[16px] bg-white dark:bg-slate-900 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Float Walk Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="font-display text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Float Walk
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              Retail Billing System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('email', language)} <span className="text-destructive">*</span>
              </Label>
              <Input 
                value={email} 
                onChange={e => { setEmail(e.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }} 
                type="email" 
                placeholder="name@example.com" 
                autoComplete="email" 
                disabled={isLoading}
                aria-invalid={!!fieldErrors.email}
                className={`rounded-[5px] border-slate-200 dark:border-slate-700 bg-transparent h-11 text-sm ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : 'focus:ring-blue-500 focus:border-transparent'}`}
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('password', language)} <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors((current) => ({ ...current, password: undefined })); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={!!fieldErrors.password}
                  className={`rounded-[5px] border-slate-200 dark:border-slate-700 bg-transparent h-11 pr-11 text-sm ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : 'focus:ring-blue-500 focus:border-transparent'}`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="relative">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="sr-only"
                />
                <label
                  htmlFor="rememberMe"
                  className="flex items-center cursor-pointer group"
                >
                  <div className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${
                    rememberMe 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                  }`}>
                    {rememberMe && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                    Remember me
                  </span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  ⚠ {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-[12px] h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-base mt-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                t('login', language)
              )}
            </Button>

            {/* Footer Link */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Secure billing system for retail operations
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
