import { useEffect, useState } from 'react';
import { Save, Store } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { PageTitle } from '@/components/shared/PageTitle';

type StoreStatus = { closed: boolean; reason: string };
export default function WebBusinessSettings() {
  const [status, setStatus] = useState<StoreStatus>({ closed: false, reason: 'We are closed today. Please call us for urgent help.' });
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    api.get('/web-settings/status')
      .then((statusResponse) => setStatus(statusResponse.data))
      .catch((error: any) => toast.error(error.message || 'Failed to load business settings'))
      .finally(() => setLoading(false));
  }, []);

  const saveStatus = async () => {
    setSavingStatus(true);
    try { await api.patch('/web-settings/status', status); toast.success('Store status updated'); }
    catch (error: any) { toast.error(error.message || 'Failed to update store status'); }
    finally { setSavingStatus(false); }
  };

  return <div className="font-web space-y-6">
    <div><PageTitle>Store status</PageTitle><p className="mt-1 text-muted-foreground">Control the public store status shown on your website.</p></div>

    <Card className="rounded-[5px] border-l-4 border-l-primary"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Store status</CardTitle><p className="mt-1 text-sm text-muted-foreground">This status is available to your website frontend.</p></div><Switch checked={status.closed} onCheckedChange={(closed) => setStatus({ ...status, closed })} aria-label="Close store" /></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between rounded-[5px] bg-muted/50 px-4 py-3"><span className="text-sm font-medium">{status.closed ? 'Store closed' : 'Store open'}</span><span className={status.closed ? 'text-sm text-destructive' : 'text-sm text-emerald-600'}>{status.closed ? 'Closed to customers' : 'Accepting customers'}</span></div><div><Label htmlFor="store-closed-reason">Closed message</Label><Textarea id="store-closed-reason" className="mt-2 rounded-[5px]" placeholder="We are closed today. Please call us for urgent help." value={status.reason} onChange={(event) => setStatus({ ...status, reason: event.target.value })} /></div><div className="flex justify-end"><Button className="rounded-[5px]" onClick={() => void saveStatus()} disabled={savingStatus}><Save className="mr-2 h-4 w-4" />{savingStatus ? 'Saving...' : 'Save store status'}</Button></div></CardContent></Card>

  </div>;
}