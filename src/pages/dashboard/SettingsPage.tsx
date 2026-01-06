import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Palette, Bell, Shield, Users, Building, Upload, Image, Globe } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/ui/loading-state";
import { useApi } from "@/hooks/useApi";
import { getHotelSettings, updateHotelSettings, HotelSettings } from "@/services/settingsService";

export default function SettingsPage() {
  const settingsApi = useApi<HotelSettings>();
  const updateApi = useApi<HotelSettings>({ showSuccessToast: true });
  
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    primaryColor: "#D4AF37",
    secondaryColor: "#1a1a2e",
  });
  
  // File states for logo and favicon
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  /**
   * GET /api/settings/hotel
   * Fetch current hotel settings including branding
   */
  const fetchSettings = async () => {
    const response = await settingsApi.execute(() => getHotelSettings());
    if (response.success && response.data) {
      setSettings(response.data);
      setFormData({
        name: response.data.name || "",
        address: response.data.address || "",
        phone: response.data.phone || "",
        email: response.data.email || "",
        primaryColor: response.data.primaryColor || "#D4AF37",
        secondaryColor: response.data.secondaryColor || "#1a1a2e",
      });
      if (response.data.logo) setLogoPreview(response.data.logo);
      if (response.data.favicon) setFaviconPreview(response.data.favicon);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFaviconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  /**
   * PUT /api/settings/hotel
   * Update hotel settings with branding (logo, favicon, name, colors)
   * 
   * Request (FormData):
   * - name: string
   * - logo: File (optional)
   * - favicon: File (optional)
   * - primaryColor: string (hex)
   * - secondaryColor: string (hex)
   * - address: string
   * - phone: string
   * - email: string
   */
  const handleSaveSettings = async () => {
    const response = await updateApi.execute(() => 
      updateHotelSettings({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        logo: logoFile || undefined,
        favicon: faviconFile || undefined,
      })
    );
    
    if (response.success) {
      setLogoFile(null);
      setFaviconFile(null);
      fetchSettings();
    }
  };

  if (settingsApi.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Settings" subtitle="Customize your hotel management system" />
        <div className="p-6">
          <LoadingState message="Loading settings..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Settings" subtitle="Customize your hotel management system" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
            {/* Hotel Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Hotel Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hotel Name</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1.5" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Address</Label>
                    <Input 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1.5" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branding - Logo & Favicon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label>Hotel Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-secondary/50 flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <Building className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 200x200px, PNG or SVG format
                      </p>
                    </div>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-3">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border bg-secondary/50 flex items-center justify-center overflow-hidden">
                      {faviconPreview ? (
                        <img src={faviconPreview} alt="Favicon preview" className="w-full h-full object-contain" />
                      ) : (
                        <Globe className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconChange}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => faviconInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Favicon
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 32x32px or 16x16px, ICO or PNG format
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color Scheme */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-border"
                      />
                      <Input 
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-border"
                      />
                      <Input 
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              variant="hero" 
              onClick={handleSaveSettings}
              disabled={updateApi.isLoading}
              className="w-full"
            >
              {updateApi.isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>

          {/* Quick Settings Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Bell, label: "Notifications", desc: "Manage alerts" },
                  { icon: Shield, label: "Security", desc: "Password & 2FA" },
                  { icon: Users, label: "Team", desc: "Manage staff" },
                  { icon: Palette, label: "Theme", desc: "Dark/Light mode" },
                ].map((item) => (
                  <Button key={item.label} variant="ghost" className="w-full justify-start h-auto py-3">
                    <item.icon className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
