import { useEffect, useState } from 'react';
import { Clock3, Cloud, Save, Store } from 'lucide-react';
import { api } from '@/services/api';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { WebTimePicker } from '@/components/web/WebFormControls';
import { toast } from 'sonner';

type StoreStatus = { closed: boolean; reason: string };
type BusinessHour = { id: number; day: string; is_closed: boolean; open_time: string | null; close_time: string | null; sort_order: number };

const dayLabel = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

export default function WebBusinessSettings() {
  const [status, setStatus] = useState<StoreStatus>({ closed: false, reason: 'We are closed today. Please call us for urgent help.' });
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/web-settings/status'), api.get('/web-settings/hours')])
      .then(([statusResponse, hoursResponse]) => { setStatus(statusResponse.data); setHours(hoursResponse.data ?? []); })
      .catch((error: any) => toast.error(error.message || 'Failed to load business settings'))
      .finally(() => setLoading(false));
  }, []);

  const saveStatus = async () => {
    setSavingStatus(true);
    try { await api.patch('/web-settings/status', status); toast.success('Store status updated'); }
    catch (error: any) { toast.error(error.message || 'Failed to update store status'); }
    finally { setSavingStatus(false); }
  };

  const saveHours = async () => {
    setSavingHours(true);
    try {
      const response = await api.put('/web-settings/hours', { hours });
      toast.success(response.google?.message || 'Business hours saved');
    } catch (error: any) { toast.error(error.message || 'Failed to update business hours'); }
    finally { setSavingHours(false); }
  };

  const updateHour = (id: number, changes: Partial<BusinessHour>) => setHours((current) => current.map((hour) => hour.id === id ? { ...hour, ...changes } : hour));
  const columns: Column<BusinessHour>[] = [
    { key: 'day', header: 'Day', sortable: true, render: (hour) => <span className="font-semibold">{dayLabel(hour.day)}</span> },
    { key: 'is_closed', header: 'Open', sortable: true, render: (hour) => <Switch checked={!hour.is_closed} onCheckedChange={(checked) => updateHour(hour.id, { is_closed: !checked })} aria-label={`Toggle ${dayLabel(hour.day)}`} /> },
    { key: 'open_time', header: 'Opening time', sortable: true, render: (hour) => <WebTimePicker value={hour.open_time ?? ''} placeholder="Pick opening time" onChange={(value) => updateHour(hour.id, { open_time: value })} /> },
    { key: 'close_time', header: 'Closing time', sortable: true, render: (hour) => <WebTimePicker value={hour.close_time ?? ''} placeholder="Pick closing time" onChange={(value) => updateHour(hour.id, { close_time: value })} /> },
  ];

  return <div className="font-web space-y-6">
    <div><div className="flex items-center gap-2 text-sm text-muted-foreground"><Store className="h-4 w-4" /> Website operations</div><h1 className="mt-1 text-2xl font-display font-bold">Store & business hours</h1><p className="mt-1 text-muted-foreground">Control the public store status and synchronize weekly hours with Google Business Profile.</p></div>

    <Card className="rounded-[5px] border-l-4 border-l-primary"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Store status</CardTitle><p className="mt-1 text-sm text-muted-foreground">This status is available to your website frontend.</p></div><Switch checked={status.closed} onCheckedChange={(closed) => setStatus({ ...status, closed })} aria-label="Close store" /></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between rounded-[5px] bg-muted/50 px-4 py-3"><span className="text-sm font-medium">{status.closed ? 'Store closed' : 'Store open'}</span><span className={status.closed ? 'text-sm text-destructive' : 'text-sm text-emerald-600'}>{status.closed ? 'Closed to customers' : 'Accepting customers'}</span></div><div><Label htmlFor="store-closed-reason">Closed message</Label><Textarea id="store-closed-reason" className="mt-2 rounded-[5px]" placeholder="We are closed today. Please call us for urgent help." value={status.reason} onChange={(event) => setStatus({ ...status, reason: event.target.value })} /></div><div className="flex justify-end"><Button className="rounded-[5px]" onClick={() => void saveStatus()} disabled={savingStatus}><Save className="mr-2 h-4 w-4" />{savingStatus ? 'Saving...' : 'Save store status'}</Button></div></CardContent></Card>

    <Card className="rounded-[5px]"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="flex items-center gap-2"><Clock3 className="h-5 w-5" />Weekly hours</CardTitle><p className="mt-1 text-sm text-muted-foreground">Changes are saved locally and synchronized to Google when OAuth is configured.</p></div><Cloud className="h-5 w-5 text-muted-foreground" /></CardHeader><CardContent><DataTable data={hours} columns={columns} searchKeys={['day']} pageSizeOptions={[7, 14]} loading={loading} /><div className="mt-5 flex justify-end"><Button className="rounded-[5px]" onClick={() => void saveHours()} disabled={savingHours || loading}><Save className="mr-2 h-4 w-4" />{savingHours ? 'Syncing...' : 'Save & sync hours'}</Button></div></CardContent></Card>
  </div>;
}