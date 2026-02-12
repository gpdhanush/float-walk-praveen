import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { uploadService } from '@/services/uploadService';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Store, Lock, Upload } from 'lucide-react';
import { ImageCropDialog } from '@/components/shared/ImageCropDialog';
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
    officeMobile: settings.phone,
    ownerName: settings.ownerName,
    gstPercent: settings.gstPercent,
    gstNumber: settings.gstNumber,
    logoUrl: settings.logoUrl,
  });
  
  const [logoError, setLogoError] = useState(false);

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
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
      officeMobile: settings.phone,
      ownerName: settings.ownerName,
      gstPercent: settings.gstPercent,
      gstNumber: settings.gstNumber,
      logoUrl: settings.logoUrl,
    });
  }, [settings]);

  const handleSaveStore = async () => {
    setIsSaving(true);
    try {
      await settings.updateSettings({
        ...storeForm,
        phone: storeForm.officeMobile,
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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
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
      setStoreForm({ ...storeForm, logoUrl: uploadedUrl });
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      
      {/* Store Details */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Update Store Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input 
                    value={storeForm.storeName} 
                    onChange={e => setStoreForm({ ...storeForm, storeName: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Owner Name / Full Name</Label>
                  <Input 
                    value={storeForm.ownerName} 
                    onChange={e => setStoreForm({ ...storeForm, ownerName: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input 
                  value={storeForm.address} 
                  onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input 
                    value={storeForm.mobile} 
                    onChange={e => setStoreForm({ ...storeForm, mobile: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Office Mobile Number</Label>
                  <Input 
                    value={storeForm.officeMobile} 
                    onChange={e => setStoreForm({ ...storeForm, officeMobile: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={user?.email || ''} 
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email is your login email</p>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input 
                    value={user?.role || ''} 
                    disabled 
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Role cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default GST %</Label>
                  <Select 
                    value={String(storeForm.gstPercent)} 
                    onValueChange={(v) => setStoreForm({ ...storeForm, gstPercent: Number(v) })}
                  >
                    <SelectTrigger>
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
                  <Label>GST Number</Label>
                  <Input 
                    value={storeForm.gstNumber} 
                    onChange={e => setStoreForm({ ...storeForm, gstNumber: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Store Logo</Label>
                <div className="flex items-center gap-4">
                  {storeForm.logoUrl && !logoError ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img 
                        src={getLogoUrl(storeForm.logoUrl) || storeForm.logoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-cover"
                        onError={() => setLogoError(true)}
                      />
                    </div>
                  ) : storeForm.logoUrl && logoError ? (
                    <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                      <span className="text-3xl font-bold text-primary-foreground">
                        {storeForm.storeName?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/webp" 
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload JPG, PNG or WEBP (max 5MB). Image will be cropped & compressed to ~300KB automatically.
                    </p>
                  </div>
                  {storeForm.logoUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setStoreForm({ ...storeForm, logoUrl: '' })} 
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password"
                    value={passwordForm.currentPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password"
                    value={passwordForm.newPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password"
                    value={passwordForm.confirmPassword} 
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSaveStore} 
          disabled={isSaving}
          size="lg"
          className="flex-1"
        >
          {isSaving ? 'Saving...' : 'Save Store Details'}
        </Button>
        <Button 
          onClick={handleChangePassword} 
          disabled={isChangingPassword}
          variant="outline"
          size="lg"
        >
          {isChangingPassword ? 'Changing...' : 'Change Password'}
        </Button>
      </div>

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
