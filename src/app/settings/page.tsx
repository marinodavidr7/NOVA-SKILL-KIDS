"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Building, UserCircle, Bell, Lock, Palette, Save, Users, GraduationCap, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser, updateUserProfile, createUserDirectly } from "@/lib/actions/auth";
import { getCentroSettings, updateCentroSettings, getEvalTemplates, updateEvalTemplates } from "@/lib/actions/settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("centro");
  const [isSavingCentro, setIsSavingCentro] = useState(false);
  const [isSavedCentro, setIsSavedCentro] = useState(false);
  const [isSavingPerfil, setIsSavingPerfil] = useState(false);
  const [isSavedPerfil, setIsSavedPerfil] = useState(false);
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Users Tab State
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', nombre: '', role: 'teacher' });
  const [isSavingUser, setIsSavingUser] = useState(false);
  
  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.nombre) return toast.error('Llena los campos requeridos');
    setIsSavingUser(true);
    try {
      const roleValue = newUser.role === 'admin-director' ? 'admin' : newUser.role;
      const titleValue = newUser.role === 'admin-director' ? 'Directora' : (newUser.role === 'admin' ? 'Administrador' : 'Maestro');
      
      const res = await createUserDirectly(newUser.username, newUser.password, newUser.nombre, roleValue, titleValue);
      if (res.success) {
        toast.success('Usuario creado exitosamente');
        setIsAddingUser(false);
        setNewUser({ username: '', password: '', nombre: '', role: 'teacher' });
        fetchUsuarios();
      } else {
        toast.error(res.error || 'Error al crear usuario');
      }
    } catch(e: any) {
      toast.error(e.message || 'Error');
    }
    setIsSavingUser(false);
  };
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [isSavingPermissions, setIsSavingPermissions] = useState<number | null>(null);

  const togglePermission = async (userId: number, currentPermissions: Record<string, boolean>, permissionKey: string, newValue: boolean) => {
    setIsSavingPermissions(userId);
    try {
      const { updateUserPermissions } = await import('@/lib/actions/auth');
      const updatedPermissions = { ...currentPermissions, [permissionKey]: newValue };
      
      const res = await updateUserPermissions(userId, updatedPermissions);
      if (res.success) {
        setUsuarios(usuarios.map(u => u.id === userId ? { ...u, permissions: updatedPermissions } : u));
        toast.success("Permisos actualizados correctamente");
      } else {
        toast.error(res.error || 'Error al actualizar permisos');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error de conexión');
    }
    setIsSavingPermissions(null);
  };

  const fetchUsuarios = async () => {
    setIsLoadingUsuarios(true);
    try {
      const { getUsersForSwitcher } = await import('@/lib/actions/auth');
      const data = await getUsersForSwitcher();
      setUsuarios(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoadingUsuarios(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setLogoPreview(base64Data); // Preview immediately

      try {
        const { uploadLogo } = await import('@/lib/actions/settings');
        const result = await uploadLogo(base64Data);
        if (result.success) {
          // Force UI refresh for components using the logo
          window.dispatchEvent(new Event('logo_updated'));
        }
      } catch (err) {
        console.error(err);
      }
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'pink' | 'emerald' | 'violet' | 'ocean' | 'patrio' | 'valentin' | 'verano'>('light');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'pink' | 'emerald' | 'violet' | 'ocean' | 'patrio' | 'valentin' | 'verano') => {
    setCurrentTheme(newTheme);
    localStorage.setItem("app_theme", newTheme);
    document.documentElement.classList.remove('dark', 'theme-pink', 'theme-emerald', 'theme-violet', 'theme-ocean', 'theme-patrio', 'theme-valentin', 'theme-verano');
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'pink') {
      document.documentElement.classList.add('theme-pink');
    } else if (newTheme === 'emerald') {
      document.documentElement.classList.add('theme-emerald');
    } else if (newTheme === 'violet') {
      document.documentElement.classList.add('theme-violet');
    } else if (newTheme === 'ocean') {
      document.documentElement.classList.add('theme-ocean');
    } else if (newTheme === 'patrio') {
      document.documentElement.classList.add('theme-patrio');
    } else if (newTheme === 'valentin') {
      document.documentElement.classList.add('theme-valentin');
    } else if (newTheme === 'verano') {
      document.documentElement.classList.add('theme-verano');
    }
    // Notify root AppShell to update layout and prevent react from resetting it
    window.dispatchEvent(new Event('theme-changed'));
  };

  const [centroData, setCentroData] = useState({
    nombre: "Nova Skill Kids",
    rnc: "130-456789-1",
    direccion: "Av. Winston Churchill #45, Distrito Nacional",
    telefono: "(809) 555-0123",
    correo: "contacto@novaskillkids.com",
    periodo: "2023 - 2024",
    strictAgeFiltering: true,
    matriculaAmount: 12000,
    evaluationsRequireObservation: true
  });

  const [perfilData, setPerfilData] = useState({
    nombre: "María García",
    cargo: "Directora",
    correo: "admin@novaskillkids.com",
    foto: ""
  });

  const [notifSettings, setNotifSettings] = useState({
    notif1: true,
    notif2: true,
    notif3: false,
    notif4: true
  });

  const [currentUserData, setCurrentUserData] = useState<any>(null);

  const [evalTemplates, setEvalTemplates] = useState<any[]>([]);
  const [isSavingTemplates, setIsSavingTemplates] = useState(false);
  const [isSavedTemplates, setIsSavedTemplates] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<number | null>(null);

  // Load from database on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") as 'light' | 'dark' | 'pink' | 'emerald' | 'violet' | 'ocean' | 'patrio' | 'valentin' | 'verano';
    if (savedTheme) setCurrentTheme(savedTheme);

    const savedNotifs = localStorage.getItem("settings_notifs");
    if (savedNotifs) setNotifSettings(JSON.parse(savedNotifs));
    
    // Check if custom logo exists by trying to load it
    setLogoPreview(`/uploads/custom-logo.png?v=${Date.now()}`);

    async function loadData() {
      const centro = await getCentroSettings();
      if (centro) {
        setCentroData(centro);
        localStorage.setItem("settings_centro", JSON.stringify(centro));
      }

      const templates = await getEvalTemplates();
      if (templates) {
        setEvalTemplates(templates);
      }

      const user = await getCurrentUser();
      if (user) {
        setCurrentUserData(user);
        
        const nombreCompleto = user.firstName ? `${user.firstName} ${user.lastName}`.trim() : (user.username === 'admin' ? 'María García' : user.username);
        setPerfilData({
          nombre: nombreCompleto,
          cargo: user.title || (user.role === 'admin' ? 'Administrador' : 'Personal'),
          correo: user.email || '',
          foto: user.avatar || ''
        });

        const userIsAdmin = user.username === 'admin' || user.role === 'admin';
        setIsAdmin(userIsAdmin);
        if (!userIsAdmin && activeTab === 'centro') {
          setActiveTab('perfil');
        }
      }
    }
    loadData();
  }, []);

  const toggleNotif = (id: keyof typeof notifSettings) => {
    const newSettings = { ...notifSettings, [id]: !notifSettings[id] };
    setNotifSettings(newSettings);
    localStorage.setItem("settings_notifs", JSON.stringify(newSettings));
  };

  const [isSavingPeriodo, setIsSavingPeriodo] = useState(false);
  const [isSavedPeriodo, setIsSavedPeriodo] = useState(false);

  const handleSaveCentro = async () => {
    setIsSavingCentro(true);
    setIsSavedCentro(false);
    
    try {
      const result = await updateCentroSettings(centroData);
      if (result.success) {
        // Save to localStorage for fast lookup / sync
        localStorage.setItem("settings_centro", JSON.stringify(centroData));
        // Notify other components
        window.dispatchEvent(new Event('settings_updated'));
        
        setIsSavingCentro(false);
        setIsSavedCentro(true);
        toast.success("Ajustes del centro infantil actualizados");
        setTimeout(() => setIsSavedCentro(false), 3000);
      } else {
        setIsSavingCentro(false);
        toast.error(result.error || "Hubo un error al guardar los ajustes del centro");
      }
    } catch(err) {
      setIsSavingCentro(false);
      toast.error("Hubo un error al guardar los ajustes");
    }
  };

  const handleSavePeriodo = async () => {
    setIsSavingPeriodo(true);
    setIsSavedPeriodo(false);
    
    try {
      const result = await updateCentroSettings(centroData);
      if (result.success) {
        localStorage.setItem("settings_centro", JSON.stringify(centroData));
        window.dispatchEvent(new Event('settings_updated'));
        
        setIsSavingPeriodo(false);
        setIsSavedPeriodo(true);
        toast.success("Periodo lectivo guardado correctamente en la base de datos");
        setTimeout(() => setIsSavedPeriodo(false), 3000);
      } else {
        setIsSavingPeriodo(false);
        toast.error(result.error || "Hubo un error al guardar el periodo");
      }
    } catch(err) {
      setIsSavingPeriodo(false);
      toast.error("Hubo un error al guardar el periodo");
    }
  };

  const handleSavePerfil = async () => {
    setIsSavingPerfil(true);
    setIsSavedPerfil(false);
    
    if (currentUserData && currentUserData.username) {
      try {
        const result = await updateUserProfile(perfilData);
        if (result.success) {
          // Avatar and profile are now fully handled by the database.
          
          // Sync last_logged_in_user so user switcher is updated
          const storedUser = localStorage.getItem("last_logged_in_user");
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              parsed.name = perfilData.nombre;
              parsed.avatar = perfilData.foto;
              localStorage.setItem("last_logged_in_user", JSON.stringify(parsed));
            } catch(e) {}
          }

          // Notify other components
          window.dispatchEvent(new Event('settings_updated'));
          
          setIsSavingPerfil(false);
          setIsSavedPerfil(true);
          toast.success("Perfil guardado correctamente");
          setTimeout(() => setIsSavedPerfil(false), 3000);
        } else {
          setIsSavingPerfil(false);
          toast.error(result.error || "Hubo un error al guardar el perfil");
        }
      } catch(err) {
        setIsSavingPerfil(false);
        toast.error('Hubo un error al guardar el perfil. Si cambiaste la foto, puede ser demasiado pesada. Intenta con una imagen más pequeña.');
      }
    } else {
      setIsSavingPerfil(false);
    }
  };

  const handleSaveTemplates = async () => {
    setIsSavingTemplates(true);
    setIsSavedTemplates(false);
    try {
      const result = await updateEvalTemplates(evalTemplates);
      if (result.success) {
        setIsSavedTemplates(true);
        toast.success("Plantillas de evaluación guardadas correctamente");
        setTimeout(() => setIsSavedTemplates(false), 3000);
      } else {
        toast.error(result.error || "Hubo un error al guardar las plantillas");
      }
    } catch(err) {
      toast.error("Hubo un error al guardar las plantillas");
    } finally {
      setIsSavingTemplates(false);
    }
  };

  const allTabs = [
    { id: "centro", label: "Centro Infantil", icon: Building, adminOnly: true },
    { id: "perfil", label: "Mi Perfil", icon: UserCircle, adminOnly: false },
    { id: "usuarios", label: "Usuarios y Accesos", icon: Users, adminOnly: false },
    { id: "notificaciones", label: "Notificaciones", icon: Bell, adminOnly: false },
    { id: "seguridad", label: "Seguridad", icon: Lock, adminOnly: false },
    { id: "apariencia", label: "Apariencia", icon: Palette, adminOnly: false },
    { id: "evaluaciones", label: "Plantillas de Evaluación", icon: GraduationCap, adminOnly: true },
    { id: "globales", label: "Config. Globales", icon: Settings, adminOnly: true },
  ];

  const [isAdmin, setIsAdmin] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("last_logged_in_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userIsAdmin = user.username === 'admin' || user.role === 'admin';
        setIsAdmin(userIsAdmin);
        if (!userIsAdmin && activeTab === 'centro') {
          setActiveTab('perfil');
        }
      } catch(e) {}
    }
  }, []);

  const tabs = allTabs.filter(t => isAdmin ? true : !t.adminOnly);

  // Fetch users when tab changes
  useEffect(() => {
    if (activeTab === 'usuarios' && usuarios.length === 0) {
      fetchUsuarios();
    }
  }, [activeTab]);

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-500/20">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración del Sistema</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra los ajustes generales, tu perfil y las preferencias de la aplicación.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation / Tabs */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full justify-start gap-3 transition-all duration-200 ${
                  isActive 
                    ? "bg-slate-100 text-slate-900 font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} /> 
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === "centro" && (
            <>
              <Card className="border-0 shadow-sm animate-fade-in">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg">Información de Nova Skill Kids</CardTitle>
                  <CardDescription>Actualiza los datos de contacto y la información oficial de la institución.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  
                  {/* Logo Upload Section */}
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" onError={() => setLogoPreview(null)} />
                      ) : (
                        <Building className="h-8 w-8 text-slate-300" />
                      )}
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <div className="h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-semibold text-slate-900">Logotipo de Nova Skill Kids</h4>
                      <p className="text-xs text-slate-500">Se usará en el menú principal y en los recibos impresos (Recomendado: PNG Cuadrado).</p>
                    </div>
                    <div>
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-sm font-medium rounded-lg shadow-sm transition-colors text-slate-700">
                          Cambiar Logo
                        </div>
                      </Label>
                      <Input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre del Centro</Label>
                      <Input 
                        value={centroData.nombre} 
                        onChange={(e) => setCentroData({...centroData, nombre: e.target.value})}
                        className="rounded-xl shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>RNC / Identificador Fiscal</Label>
                      <Input 
                        value={centroData.rnc} 
                        onChange={(e) => setCentroData({...centroData, rnc: e.target.value})}
                        className="rounded-xl shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Dirección Principal</Label>
                      <Input 
                        value={centroData.direccion} 
                        onChange={(e) => setCentroData({...centroData, direccion: e.target.value})}
                        className="rounded-xl shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono de Contacto</Label>
                      <Input 
                        value={centroData.telefono} 
                        onChange={(e) => setCentroData({...centroData, telefono: e.target.value})}
                        className="rounded-xl shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Correo Oficial</Label>
                      <Input 
                        type="email"
                        value={centroData.correo} 
                        onChange={(e) => setCentroData({...centroData, correo: e.target.value})}
                        className="rounded-xl shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveCentro}
                      disabled={isSavingCentro}
                      className={`${isSavedCentro ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'} text-white gap-2 rounded-xl px-6 transition-colors`}
                    >
                      <Save className={`h-4 w-4 ${isSavingCentro ? 'animate-spin' : ''}`} /> 
                      {isSavingCentro ? 'Guardando...' : isSavedCentro ? '¡Guardado!' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm border-t-4 border-t-amber-500 animate-fade-in">
                <CardHeader className="bg-amber-50/50 pb-4">
                  <CardTitle className="text-lg text-amber-800">Año Escolar Activo</CardTitle>
                  <CardDescription>El periodo lectivo actual para reportes y evaluaciones.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label>Periodo</Label>
                      <Input 
                        value={centroData.periodo ?? ""} 
                        placeholder="Ej. 2024 - 2025"
                        onChange={(e) => setCentroData({...centroData, periodo: e.target.value})}
                        className="rounded-xl shadow-sm mt-1" 
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Estado</Label>
                      <div className="mt-1 h-10 flex items-center px-3 bg-emerald-50 text-emerald-700 font-semibold rounded-xl border border-emerald-200">
                        En Curso
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 mt-2">
                    <Button 
                      onClick={handleSavePeriodo}
                      disabled={isSavingPeriodo}
                      className={`${isSavedPeriodo ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'} text-white gap-2 rounded-xl px-6 transition-colors`}
                    >
                      <Save className={`h-4 w-4 ${isSavingPeriodo ? 'animate-spin' : ''}`} /> 
                      {isSavingPeriodo ? 'Guardando...' : isSavedPeriodo ? '¡Guardado!' : 'Guardar Periodo'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "perfil" && (
            <Card className="border-0 shadow-sm animate-fade-in">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Mi Perfil</CardTitle>
                <CardDescription>Información personal del administrador activo.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Profile Photo Upload Section */}
                <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                    {perfilData.foto ? (
                      <img src={perfilData.foto} alt="Perfil" className="h-full w-full object-cover" onError={() => setPerfilData({...perfilData, foto: ""})} />
                    ) : (
                      <div className="bg-indigo-100 h-full w-full flex items-center justify-center">
                        <span className="text-indigo-700 font-bold text-2xl">
                          {perfilData.nombre ? perfilData.nombre.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900">Foto de Perfil</h4>
                    <p className="text-xs text-slate-500">Esta imagen aparecerá en tu perfil y cabecera.</p>
                  </div>
                  <div>
                    <Label htmlFor="profile-upload" className="cursor-pointer">
                      <div className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-sm font-medium rounded-lg shadow-sm transition-colors text-slate-700">
                        Cambiar Foto
                      </div>
                    </Label>
                    <Input 
                      id="profile-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 256;
                            const MAX_HEIGHT = 256;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                              if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                              }
                            } else {
                              if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            
                            const base64Data = canvas.toDataURL('image/jpeg', 0.8);
                            const newData = {...perfilData, foto: base64Data};
                            setPerfilData(newData);
                            
                            // Auto-save to sync immediately in database and localStorage
                            if (currentUserData && currentUserData.username) {
                              updateUserProfile(newData).then((res) => {
                                if (res.success) {
                                  try {
                                    // Profile state updated above, DB synced via handleSavePerfil or explicit save.
                                    
                                    // Update last_logged_in_user avatar
                                    const storedUser = localStorage.getItem("last_logged_in_user");
                                    if (storedUser) {
                                      const parsed = JSON.parse(storedUser);
                                      parsed.avatar = base64Data;
                                      localStorage.setItem("last_logged_in_user", JSON.stringify(parsed));
                                    }
                                    
                                    window.dispatchEvent(new Event('settings_updated'));
                                  } catch(e) {}
                                } else {
                                  toast.error('Error al guardar la foto de perfil en la base de datos.');
                                }
                              }).catch(() => {
                                toast.error('Error al guardar la foto de perfil.');
                              });
                            }
                          };
                          if (event.target?.result) {
                            img.src = event.target.result as string;
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input 
                      value={perfilData.nombre} 
                      onChange={(e) => setPerfilData({...perfilData, nombre: e.target.value})}
                      className="rounded-xl shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input 
                      value={perfilData.cargo} 
                      onChange={(e) => setPerfilData({...perfilData, cargo: e.target.value})}
                      disabled={!isAdmin} 
                      className={`rounded-xl shadow-sm ${!isAdmin ? 'bg-slate-50 text-slate-500' : ''}`} 
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Correo de Acceso</Label>
                    <Input 
                      type="email" 
                      value={perfilData.correo} 
                      onChange={(e) => setPerfilData({...perfilData, correo: e.target.value})}
                      disabled={!isAdmin} 
                      className={`rounded-xl shadow-sm ${!isAdmin ? 'bg-slate-50 text-slate-500' : ''}`} 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSavePerfil}
                    disabled={isSavingPerfil}
                    className={`${isSavedPerfil ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'} text-white gap-2 rounded-xl px-6 transition-colors`}
                  >
                    <Save className={`h-4 w-4 ${isSavingPerfil ? 'animate-spin' : ''}`} /> 
                    {isSavingPerfil ? 'Guardando...' : isSavedPerfil ? '¡Guardado!' : 'Guardar Perfil'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "usuarios" && (
            <Card className="border-0 shadow-sm animate-fade-in">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Gestión de Usuarios y Accesos</CardTitle>
                <CardDescription>
                  Aquí puedes ver todas las cuentas con acceso al sistema. Los PINs de los maestros se generan en la sección de Personal.
                </CardDescription>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setIsAddingUser(!isAddingUser)} size="sm" variant={isAddingUser ? 'outline' : 'default'} className={!isAddingUser ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}>
                    {isAddingUser ? 'Cancelar' : 'Agregar Usuario'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isAddingUser && (
                  <div className="mb-6 p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl space-y-4 animate-in fade-in zoom-in-95">
                    <h3 className="font-semibold text-slate-800">Crear Nuevo Usuario</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre Completo</Label>
                        <Input value={newUser.nombre} onChange={e => setNewUser({...newUser, nombre: e.target.value})} placeholder="Ej. Juan Pérez" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre de Usuario</Label>
                        <Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="usuario123" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Contraseña</Label>
                        <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="********" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Rol del Sistema</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                          <option value="admin">Administrador (Acceso Total)</option>
                          <option value="admin-director">Directora (Acceso Administrativo)</option>
                          <option value="teacher">Maestro (Acceso Limitado)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={handleCreateUser} disabled={isSavingUser} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        {isSavingUser ? 'Guardando...' : 'Guardar Usuario'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {isLoadingUsuarios ? (
                  <div className="py-8 text-center text-slate-500">Cargando usuarios...</div>
                ) : (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                        <tr>
                          <th className="px-4 py-3">Usuario Interno</th>
                          <th className="px-4 py-3">Nombre</th>
                          <th className="px-4 py-3">Rol</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usuarios.map((u) => (
                          <React.Fragment key={u.id}>
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                              <td className="px-4 py-3 text-slate-600">{u.name}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  u.role === 'admin' 
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {u.role === 'admin' ? 'Administrador' : 'Maestro'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {u.role !== 'admin' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs text-slate-600 hover:text-indigo-600 border-slate-200 shadow-sm rounded-lg"
                                    onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                                  >
                                    {expandedUserId === u.id ? 'Ocultar Permisos' : 'Gestionar Permisos'}
                                  </Button>
                                )}
                              </td>
                            </tr>
                            {expandedUserId === u.id && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={4} className="px-4 py-4 border-b border-slate-100">
                                  <div className="bg-white border rounded-xl p-4 shadow-sm">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-sm">Permisos de {u.name}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {[
                                        { key: 'assignChild', label: 'Agregar niño a un aula' },
                                        { key: 'removeChild', label: 'Remover niño de un aula' },
                                        { key: 'createClassroom', label: 'Crear un aula' },
                                        { key: 'editClassroom', label: 'Editar un aula' },
                                        { key: 'deleteClassroom', label: 'Eliminar un aula' },
                                        { key: 'registerChild', label: 'Registrar un nuevo niño' },
                                        { key: 'planMenu', label: 'Planear menú' },
                                        { key: 'viewIncome', label: 'Ver ingresos del mes (Dashboard)' }
                                      ].map(perm => (
                                        <div key={perm.key} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                          <span className="text-sm text-slate-700 font-medium">{perm.label}</span>
                                          <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                              type="checkbox" 
                                              className="sr-only peer"
                                              checked={!!u.permissions?.[perm.key]}
                                              disabled={isSavingPermissions === u.id}
                                              onChange={(e) => togglePermission(u.id, u.permissions || {}, perm.key, e.target.checked)}
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                    {isSavingPermissions === u.id && (
                                      <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                                        <Save className="h-3 w-3 animate-spin" /> Guardando...
                                      </p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "notificaciones" && (
            <Card className="border-0 shadow-sm animate-fade-in">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Preferencias de Notificaciones</CardTitle>
                <CardDescription>Decide qué alertas deseas recibir y por qué canales.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-4">
                  {[
                    { id: 'notif1', label: "Nuevos ingresos de niños" },
                    { id: 'notif2', label: "Pagos de mensualidad atrasados" },
                    { id: 'notif3', label: "Avisos de mantenimiento programado" },
                    { id: 'notif4', label: "Mensajes de padres y tutores" }
                  ].map((setting) => {
                    const isEnabled = notifSettings[setting.id as keyof typeof notifSettings];
                    return (
                      <div key={setting.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="font-medium text-slate-800">{setting.label}</p>
                          <p className="text-sm text-slate-500">Recibir notificación en la campana y por correo.</p>
                        </div>
                        <div 
                          className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${isEnabled ? 'bg-violet-500' : 'bg-slate-200'}`}
                          onClick={() => toggleNotif(setting.id as keyof typeof notifSettings)}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${isEnabled ? 'left-[22px]' : 'left-0.5'}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "seguridad" && (
            <Card className="border-0 shadow-sm animate-fade-in">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Seguridad y Acceso</CardTitle>
                <CardDescription>Gestiona tu contraseña y sesiones activas.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Password Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">Contraseña</h3>
                    <div className="space-y-2">
                      <Label>Contraseña Actual</Label>
                      <Input type="password" placeholder="••••••••" className="rounded-xl shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nueva Contraseña</Label>
                      <Input type="password" placeholder="••••••••" className="rounded-xl shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Nueva Contraseña</Label>
                      <Input type="password" placeholder="••••••••" className="rounded-xl shadow-sm" />
                    </div>
                    <div className="pt-2">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                        Actualizar Contraseña
                      </Button>
                    </div>
                  </div>

                  {/* PIN Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b pb-2">PIN de Acceso Rápido</h3>
                    <p className="text-sm text-slate-500">
                      Configura un PIN numérico para iniciar sesión rápidamente sin tener que escribir tu contraseña completa cada vez.
                    </p>
                    <div className="space-y-2 relative">
                      <Label>Nuevo PIN (4 dígitos)</Label>
                      <Input 
                        id="new-pin"
                        type="password" 
                        maxLength={4}
                        placeholder="••••" 
                        className="rounded-xl shadow-sm text-center text-xl tracking-widest" 
                      />
                    </div>
                    {/* Add a state-based message container via DOM manipulation instead of alert to avoid refactoring the entire component state */}
                    <div id="pin-message-container" className="text-sm font-medium h-5"></div>
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all"
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          const msgContainer = document.getElementById('pin-message-container');
                          const pinInput = document.getElementById('new-pin') as HTMLInputElement;
                          const pin = pinInput.value;
                          
                          const showMsg = (text: string, isError: boolean) => {
                            if(msgContainer) {
                              msgContainer.textContent = text;
                              msgContainer.className = `text-sm font-medium h-5 ${isError ? 'text-rose-500' : 'text-emerald-600'}`;
                              setTimeout(() => { if(msgContainer) msgContainer.textContent = ''; }, 4000);
                            }
                          };

                          if (pin.length < 4) {
                            showMsg("El PIN debe tener 4 dígitos.", true);
                            return;
                          }

                          btn.disabled = true;
                          btn.innerHTML = "Guardando...";
                          
                          try {
                            const { setupUserPin } = await import('@/lib/actions/auth');
                            const res = await setupUserPin(pin);
                            if (res.success) {
                              showMsg("¡PIN configurado! Úsalo la próxima vez.", false);
                              pinInput.value = '';
                            } else {
                              showMsg("Error: " + res.error, true);
                            }
                          } catch(err) {
                            showMsg("Error al conectar.", true);
                          }
                          
                          btn.disabled = false;
                          btn.innerHTML = "Guardar PIN";
                        }}
                      >
                        Guardar PIN
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "apariencia" && (
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in bg-white dark:bg-slate-900">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <CardTitle className="text-lg text-slate-800 dark:text-slate-100 font-outfit">Apariencia del Sistema</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Personaliza los colores y el tema de la aplicación.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Modo Claro */}
                  <div 
                    onClick={() => handleThemeChange('light')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'light' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-slate-50 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-slate-200/50">
                      <div className="w-1/3 bg-slate-900 h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-slate-50">
                        <div className="w-full h-2 bg-violet-200 rounded"></div>
                        <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Claro</p>
                  </div>
                  
                  {/* Modo Oscuro */}
                  <div 
                    onClick={() => handleThemeChange('dark')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'dark' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-slate-900 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-slate-800">
                      <div className="w-1/3 bg-slate-950 h-full border-r border-slate-800"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-slate-900">
                        <div className="w-full h-2 bg-slate-700 rounded"></div>
                        <div className="w-1/2 h-2 bg-slate-800 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Oscuro</p>
                  </div>

                  {/* Modo Rosado */}
                  <div 
                    onClick={() => handleThemeChange('pink')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'pink' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-rose-50 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-rose-200/50">
                      <div className="w-1/3 bg-slate-900 h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-rose-50/50">
                        <div className="w-full h-2 bg-rose-200 rounded"></div>
                        <div className="w-1/2 h-2 bg-rose-100 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Rosado</p>
                  </div>

                  {/* Modo Esmeralda */}
                  <div 
                    onClick={() => handleThemeChange('emerald')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'emerald' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-emerald-50/50 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-emerald-200/50">
                      <div className="w-1/3 bg-slate-900 h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-emerald-50/20">
                        <div className="w-full h-2 bg-emerald-200 rounded"></div>
                        <div className="w-1/2 h-2 bg-emerald-100 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Esmeralda</p>
                  </div>

                  {/* Modo Violeta */}
                  <div 
                    onClick={() => handleThemeChange('violet')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'violet' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-violet-50/50 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-violet-200/50">
                      <div className="w-1/3 bg-slate-900 h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-violet-50/20">
                        <div className="w-full h-2 bg-violet-200 rounded"></div>
                        <div className="w-1/2 h-2 bg-violet-100 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Violeta</p>
                  </div>

                  {/* Modo Océano */}
                  <div 
                    onClick={() => handleThemeChange('ocean')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'ocean' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-sky-50/50 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-sky-200/50">
                      <div className="w-1/3 bg-slate-900 h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-sky-50/20">
                        <div className="w-full h-2 bg-sky-200 rounded"></div>
                        <div className="w-1/2 h-2 bg-sky-100 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Océano</p>
                  </div>

                  {/* Modo Patrio (27 de Febrero) */}
                  <div 
                    onClick={() => handleThemeChange('patrio')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'patrio' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-gradient-to-r from-blue-900/10 via-white to-red-900/10 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-slate-200/50 dark:border-slate-800">
                      <div className="w-1/3 bg-gradient-to-b from-blue-800 to-red-700 h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-slate-50 dark:bg-slate-900">
                        <div className="w-full h-2 bg-blue-300 dark:bg-blue-950/40 rounded"></div>
                        <div className="w-1/2 h-2 bg-red-300 dark:bg-red-950/40 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Patrio 🇩🇴</p>
                  </div>

                  {/* Modo Valentín (14 de Febrero) */}
                  <div 
                    onClick={() => handleThemeChange('valentin')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'valentin' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-gradient-to-r from-rose-900/10 via-white to-red-900/10 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-slate-200/50 dark:border-slate-800">
                      <div className="w-1/3 bg-gradient-to-b from-[#3b000b] to-[#5a0016] h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-slate-50 dark:bg-slate-900">
                        <div className="w-full h-2 bg-rose-200 dark:bg-rose-950/40 rounded"></div>
                        <div className="w-1/2 h-2 bg-red-200 dark:bg-red-950/40 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Valentín 💖</p>
                  </div>

                  {/* Modo Verano (Vacaciones Escolares / Campamento) */}
                  <div 
                    onClick={() => handleThemeChange('verano')}
                    className={`border-2 p-4 rounded-xl cursor-pointer text-center transition-all ${
                      currentTheme === 'verano' 
                        ? 'border-emerald-600 ring-2 ring-emerald-500/25 bg-emerald-50/5' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="w-full h-16 bg-gradient-to-r from-amber-400/20 via-white to-sky-400/20 rounded-lg mb-3 shadow-inner flex overflow-hidden border border-slate-200/50 dark:border-slate-800">
                      <div className="w-1/3 bg-gradient-to-b from-[#BAE6FD] to-[#FEF3C7] h-full"></div>
                      <div className="w-2/3 flex flex-col p-2 gap-1 bg-slate-50 dark:bg-slate-900">
                        <div className="w-full h-2 bg-amber-200 dark:bg-amber-950/40 rounded"></div>
                        <div className="w-1/2 h-2 bg-sky-200 dark:bg-sky-950/40 rounded"></div>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Modo Verano ☀️</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "evaluaciones" && (
            <Card className="border-0 shadow-sm animate-fade-in">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Plantillas de Evaluación de Desarrollo</CardTitle>
                <CardDescription>Configura las áreas y los indicadores que los profesores evaluarán en cada niño.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {evalTemplates.map((area, areaIdx) => (
                  <div key={area.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-3">
                        <GripVertical className="text-slate-400 h-5 w-5 cursor-move" />
                        <Input 
                          value={area.name}
                          onChange={(e) => {
                            const newTemplates = [...evalTemplates];
                            newTemplates[areaIdx].name = e.target.value;
                            setEvalTemplates(newTemplates);
                          }}
                          className="font-bold text-slate-800 border-transparent hover:border-slate-300 focus:border-violet-500 bg-transparent px-2 -ml-2"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => {
                          setAreaToDelete(areaIdx);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      {area.indicators.map((indicator: string, indIdx: number) => (
                        <div key={indIdx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2"></div>
                          <Input 
                            value={indicator}
                            onChange={(e) => {
                              const newTemplates = [...evalTemplates];
                              newTemplates[areaIdx].indicators[indIdx] = e.target.value;
                              setEvalTemplates(newTemplates);
                            }}
                            className="h-8 text-sm"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                            onClick={() => {
                              const newTemplates = [...evalTemplates];
                              newTemplates[areaIdx].indicators.splice(indIdx, 1);
                              setEvalTemplates(newTemplates);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 mt-2 gap-1 pl-2"
                        onClick={() => {
                          const newTemplates = [...evalTemplates];
                          newTemplates[areaIdx].indicators.push("Nuevo Indicador");
                          setEvalTemplates(newTemplates);
                        }}
                      >
                        <Plus className="h-4 w-4" /> Añadir Indicador
                      </Button>
                    </div>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-2 text-slate-500 hover:text-slate-800"
                  onClick={() => {
                    const newTemplates = [...evalTemplates];
                    newTemplates.push({
                      id: `area_${Date.now()}`,
                      name: "Nueva Área",
                      indicators: ["Nuevo Indicador"]
                    });
                    setEvalTemplates(newTemplates);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Añadir Nueva Área
                </Button>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    onClick={handleSaveTemplates}
                    disabled={isSavingTemplates}
                    className={`${isSavedTemplates ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-violet-600 hover:bg-violet-700'} text-white gap-2 rounded-xl px-6 transition-colors`}
                  >
                    <Save className={`h-4 w-4 ${isSavingTemplates ? 'animate-spin' : ''}`} /> 
                    {isSavingTemplates ? 'Guardando...' : isSavedTemplates ? '¡Guardado!' : 'Guardar Plantillas'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "globales" && (
            <Card className="border-0 shadow-sm animate-fade-in">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Configuraciones Globales</CardTitle>
                <CardDescription>Ajustes generales del comportamiento del sistema.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Restringir asignación por edad en Aulas</h4>
                    <p className="text-xs text-slate-500 mt-1">Solo mostrará niños cuya edad encaje en el rango (Mín - Máx) configurado para cada aula.</p>
                  </div>
                  <Label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={centroData.strictAgeFiltering !== false}
                      onChange={(e) => setCentroData({...centroData, strictAgeFiltering: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </Label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Observaciones Generales Obligatorias</h4>
                    <p className="text-xs text-slate-500 mt-1">Si está activo, las maestras deberán llenar el campo de observaciones al evaluar a un niño. Si se apaga, será opcional.</p>
                  </div>
                  <Label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={centroData.evaluationsRequireObservation !== false}
                      onChange={(e) => setCentroData({...centroData, evaluationsRequireObservation: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </Label>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Costo de Matrícula (Inscripción)</h4>
                    <p className="text-xs text-slate-500 mt-1">Monto por defecto al generar factura de matrícula para nuevos ingresos.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-medium">RD$</span>
                    <Input 
                      type="number" 
                      min="0"
                      className="pl-12 rounded-xl shadow-sm bg-white" 
                      value={centroData.matriculaAmount !== undefined ? centroData.matriculaAmount : 12000}
                      onChange={(e) => setCentroData({...centroData, matriculaAmount: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSaveCentro}
                    disabled={isSavingCentro}
                    className={`${isSavedCentro ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'} text-white gap-2 rounded-xl px-6 transition-colors`}
                  >
                    <Save className={`h-4 w-4 ${isSavingCentro ? 'animate-spin' : ''}`} /> 
                    {isSavingCentro ? 'Guardando...' : isSavedCentro ? '¡Guardado!' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      <Dialog open={areaToDelete !== null} onOpenChange={(open) => !open && setAreaToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar área completa?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Todos los indicadores de esta área también serán eliminados de la plantilla.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:justify-end mt-4">
            <Button variant="outline" onClick={() => setAreaToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => {
              if (areaToDelete !== null) {
                const newTemplates = [...evalTemplates];
                newTemplates.splice(areaToDelete, 1);
                setEvalTemplates(newTemplates);
                setAreaToDelete(null);
              }
            }}>
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
