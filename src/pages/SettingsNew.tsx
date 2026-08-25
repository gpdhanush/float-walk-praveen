import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { uploadService } from '@/services/uploadService';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '../components/ui/sonner';
import { Eye, EyeOff, Store, Lock, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageCropDialog } from '@/components/shared/ImageCropDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageTitle } from '@/components/shared/PageTitle';
import { validateImageFile } from '@/lib/imageUtils';
import { getLogoUrl } from '@/lib/utils/logoUtils';

export default function SettingsNew() {
  const settings = useSettingsStore();
  const { user } = useAuthStore();
  
  // Store Settings Form
  const [storeForm, setStoreForm] = useState({
    storeName: settings.storeName,
    address: settings.address,
    mobile: settings.mobile,
    officeMobile: settings.officePhone,
    ownerName: settings.ownerName,
    gstPercent: settings.gstPercent,
    gstNumber: settings.gstNumber,
    logoUrl: settings.logoUrl,
  });
  
  const [logoError, setLogoError] = useState(false);
  const [removeLogoOpen, setRemoveLogoOpen] = useState(false);

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  
  // Image crop states
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  const [tempImageBlob, setTempImageBlob] = useState<Blob | null>(null);

  // Update form when settings change
  useEffect(() => {
    setStoreForm({
      storeName: settings.storeName,
      address: settings.address,
      mobile: settings.mobile,
      officeMobile: settings.officePhone,
      ownerName: settings.ownerName,
      gstPercent: settings.gstPercent,
      gstNumber: settings.gstNumber,
      logoUrl: settings.logoUrl,
    });
  }, [settings]);

  const handleSaveStore = async () => {
    const nextErrors: Record<string, string> = {};
    if (!storeForm.storeName.trim()) nextErrors.storeName = 'Store name is required';
    if (!storeForm.ownerName.trim()) nextErrors.ownerName = 'Owner name is required';
    if (!storeForm.address.trim()) nextErrors.address = 'Address is required';
    if (!/^\d{10}$/.test(storeForm.mobile)) nextErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (storeForm.officeMobile && !/^\d{10}$/.test(storeForm.officeMobile)) nextErrors.officeMobile = 'Enter a valid 10-digit mobile number';
    setStoreErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setIsSaving(true);
    try {
      await settings.updateSettings({
        ...storeForm,
        officePhone: storeForm.officeMobile,
      });
      
      // Update auth store with new owner name
      if (user) {
        useAuthStore.setState({ 
          user: { 
            ...user, 
            name: storeForm.ownerName 
          } 
        });
      }
      
      toast.success('Store details saved successfully');
    } catch (error: any) {
      console.error('Failed to save store details:', error);
      toast.error(error?.message || 'Failed to save store details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const nextErrors: Record<string, string> = {};
    if (!passwordForm.currentPassword) nextErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) nextErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) nextErrors.newPassword = 'Password must be at least 6 characters';
    if (!passwordForm.confirmPassword) nextErrors.confirmPassword = 'Please confirm your new password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      toast.success('Password changed successfully');
      setIsPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      setShowPasswords({ current: false, next: false, confirm: false });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Read file and show crop dialog
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageSrc(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      // Upload the cropped image to backend
      const uploadedUrl = await uploadService.uploadLogo(croppedBlob, 'logo.jpg');
      setLogoError(false);
      setStoreForm((current) => ({ ...current, logoUrl: uploadedUrl }));
      await settings.updateSettings({ logoUrl: uploadedUrl });
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setShowCropDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle>Settings</PageTitle>

      <div className="grid grid-cols-1 gap-6">
        {/* Store Details - wide */}
        <div>
          <Card className="shadow-md">
            <CardHeader className="border-b border-border/70 bg-muted/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Store className="w-5 h-5" />
                    Update Store Details
                  </CardTitle>
                  <CardDescription className="mt-1 max-w-2xl">Manage the store information used throughout your billing documents.</CardDescription>
                </div>
                <Button type="button" onClick={() => setIsPasswordDialogOpen(true)} className="shrink-0 rounded-[5px] bg-primary text-primary-foreground hover:bg-primary/90">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardHeader>
            <form id="store-details-form" onSubmit={(event) => { event.preventDefault(); void handleSaveStore(); }}>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="font-semibold">Store Name <span className="text-destructive">*</span></Label>
                  <Input 
                    value={storeForm.storeName} 
                    onChange={e => { setStoreForm({ ...storeForm, storeName: e.target.value }); setStoreErrors(errors => ({ ...errors, storeName: '' })); }}
                    placeholder="Enter store name"
                    className="bg-transparent"
                    aria-invalid={!!storeErrors.storeName}
                  />
                  {storeErrors.storeName && <p className="text-xs text-destructive">{storeErrors.storeName}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Owner Name / Full Name <span className="text-destructive">*</span></Label>
                  <Input 
                    value={storeForm.ownerName} 
                    onChange={e => { setStoreForm({ ...storeForm, ownerName: e.target.value }); setStoreErrors(errors => ({ ...errors, ownerName: '' })); }}
                    placeholder="Enter owner name"
                    className="bg-transparent"
                    aria-invalid={!!storeErrors.ownerName}
                  />
                  {storeErrors.ownerName && <p className="text-xs text-destructive">{storeErrors.ownerName}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Mobile <span className="text-destructive">*</span></Label>
                  <Input 
                    value={storeForm.mobile}
                    maxLength={10}
                    inputMode="numeric"
                    onChange={e => { const mobile = e.target.value.replace(/\D/g, '').slice(0, 10); setStoreForm({ ...storeForm, mobile }); setStoreErrors(errors => ({ ...errors, mobile: '' })); }}
                    placeholder="10-digit mobile number"
                    className="bg-transparent"
                    aria-invalid={!!storeErrors.mobile}
                  />
                  {storeErrors.mobile && <p className="text-xs text-destructive">{storeErrors.mobile}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Office Mobile Number</Label>
                  <Input 
                    value={storeForm.officeMobile}
                    maxLength={10}
                    inputMode="numeric"
                    onChange={e => { const officeMobile = e.target.value.replace(/\D/g, '').slice(0, 10); setStoreForm({ ...storeForm, officeMobile }); setStoreErrors(errors => ({ ...errors, officeMobile: '' })); }}
                    placeholder="Optional 10-digit number"
                    className="bg-transparent"
                    aria-invalid={!!storeErrors.officeMobile}
                  />
                  {storeErrors.officeMobile && <p className="text-xs text-destructive">{storeErrors.officeMobile}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Default GST %</Label>
                  <Select 
                    value={Number.isFinite(Number(storeForm.gstPercent)) ? String(Number(storeForm.gstPercent)) : ''} 
                    onValueChange={(v) => setStoreForm({ ...storeForm, gstPercent: Number(v) })}
                  >
                    <SelectTrigger className="bg-transparent">
                      <SelectValue placeholder="Select GST %" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">GST Number</Label>
                  <Input 
                    value={storeForm.gstNumber}
                    placeholder="Enter GST number"
                    onChange={e => setStoreForm({ ...storeForm, gstNumber: e.target.value })}
                    className="bg-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold">Address <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={storeForm.address}
                    onChange={e => { setStoreForm({ ...storeForm, address: e.target.value }); setStoreErrors(errors => ({ ...errors, address: '' })); }}
                    placeholder="Enter store address"
                    className="min-h-20 resize-y bg-transparent"
                    aria-invalid={!!storeErrors.address}
                  />
                  {storeErrors.address && <p className="text-xs text-destructive">{storeErrors.address}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Store Logo</Label>
                  <div className="flex items-center gap-4">
                    {storeForm.logoUrl && !logoError ? (
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700">
                        <img src={getLogoUrl(storeForm.logoUrl) || storeForm.logoUrl} alt="Logo Preview" className="h-full w-full object-cover" onError={() => setLogoError(true)} />
                      </div>
                    ) : storeForm.logoUrl && logoError ? (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-primary dark:border-gray-700">
                        <span className="text-3xl font-bold text-primary-foreground">{storeForm.storeName?.charAt(0)?.toUpperCase() || 'S'}</span>
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileSelect} className="cursor-pointer bg-transparent" />
                    </div>
                    {storeForm.logoUrl && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setRemoveLogoOpen(true)} className="rounded-[5px] border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

            </CardContent>
            <CardFooter className="justify-end border-t border-border/70 pt-4">
              <Button type="submit" form="store-details-form" disabled={isSaving} size="lg" className="rounded-[5px]">{isSaving ? 'Updating...' : 'Update Store Details'}</Button>
            </CardFooter>
            </form>
          </Card>
        </div>

      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="rounded-[5px] sm:max-w-md" onInteractOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>Update the password used to access the billing system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void handleChangePassword(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={e => { setPasswordForm({ ...passwordForm, currentPassword: e.target.value }); setPasswordErrors(errors => ({ ...errors, currentPassword: '' })); }} placeholder="Enter current password" className="pr-10" aria-invalid={!!passwordErrors.currentPassword} />
                <button type="button" aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'} onClick={() => setShowPasswords(value => ({ ...value, current: !value.current }))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label>New Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input type={showPasswords.next ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => { setPasswordForm({ ...passwordForm, newPassword: e.target.value }); setPasswordErrors(errors => ({ ...errors, newPassword: '' })); }} placeholder="Minimum 6 characters" className="pr-10" aria-invalid={!!passwordErrors.newPassword} />
                <button type="button" aria-label={showPasswords.next ? 'Hide new password' : 'Show new password'} onClick={() => setShowPasswords(value => ({ ...value, next: !value.next }))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showPasswords.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>}
              <p className="text-xs text-muted-foreground">Use uppercase, lowercase, numbers, and symbols.</p>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={e => { setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }); setPasswordErrors(errors => ({ ...errors, confirmPassword: '' })); }} placeholder="Confirm new password" className="pr-10" aria-invalid={!!passwordErrors.confirmPassword} />
                <button type="button" aria-label={showPasswords.confirm ? 'Hide confirmed password' : 'Show confirmed password'} onClick={() => setShowPasswords(value => ({ ...value, confirm: !value.confirm }))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>}
            </div>
            <DialogFooter className="flex-row justify-end gap-2 space-x-0">
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={isChangingPassword} className="rounded-[5px] border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">Close</Button>
              <Button type="button" onClick={() => { setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordErrors({}); }} disabled={isChangingPassword} className="rounded-[5px] bg-red-600 text-white hover:bg-red-700">Reset</Button>
              <Button type="submit" disabled={isChangingPassword} className="rounded-[5px]">{isChangingPassword ? 'Changing...' : 'Change Password'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeLogoOpen}
        onOpenChange={setRemoveLogoOpen}
        onConfirm={() => {
          setStoreForm({ ...storeForm, logoUrl: '' });
          setRemoveLogoOpen(false);
        }}
        title="Remove Store Logo"
        description="Are you sure you want to remove the store logo?"
        confirmLabel="Remove Logo"
      />

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={showCropDialog}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
        onClose={() => setShowCropDialog(false)}
      />
    </div>
  );
}
