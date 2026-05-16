import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Save,
  Upload,
  X,
  Store,
  Paintbrush,
  Menu,
  Share2,
  ShoppingCart,
  CreditCard,
  Folder,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { toast as showToast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { defaultStoreSettings, getStoreSettings, saveStoreSettings, handleImageUpload, deepMerge, resetStoreSettings } from '@/lib/localStorage';
import { getNormalizedLink, getCategoryPagePath } from '@/lib/categoryUtils';
import phpserver from '@/lib/phpserver';

// Define settings interface
interface Coupon {
  code: string;
  discount: number;
}

interface StoreSettings {
  storeName: string;
  title: string;
  subTitle: string;
  storeNameFont: string;
  storeNameColor: string;
  storeNameSize: string;
  pageTitle: string;
  pageTitleFont: string;
  pageTitleColor: string;
  pageTitleSize: string;
  pageSubtitle: string;
  logoImage: string;
  mapLink: string;
  shareImage: string;
  footerText: string;
  deliveryInfo: string;
  showPaymentMethods: boolean;
  storeEmail?: string;
  storeAddress?: string;
  storePhone?: string;
  activePaymentMethods: {
    credit: boolean;
    debit: boolean;
    pix: boolean;
    cash: boolean;
    other: boolean;
  };
  bannerConfig: {
    imageUrl: string;
    title: string;
    subtitle: string;
    showExploreButton: boolean;
    textColor: string;
    buttonColor: string;
  };
  headerLinks: {
    novidades: boolean;
    masculino: boolean;
    feminino: boolean;
    kids: boolean;
    calcados: boolean;
    acessorios: boolean;
    off: boolean;
    customLinks: {
      label: string;
      enabled: boolean;
    }[];
  };
  headerColor: string;
  headerLinkColor: string;
  categoryHighlights: {
    enabled: boolean;
    title: string;
    categories: {
      name: string;
      image: string;
      link: string;
    }[];
  };
  socialMedia: {
    enabled: boolean;
    instagram: {
      enabled: boolean;
      url: string;
    };
    facebook: {
      enabled: boolean;
      url: string;
    };
    whatsapp: {
      enabled: boolean;
      url: string;
    };
    tiktok: {
      enabled: boolean;
      url: string;
    };
    twitter: {
      enabled: boolean;
      url: string;
    };
    website: {
      enabled: boolean;
      url: string;
    };
  };
  aboutUs?: {
    enabled: boolean;
    title: string;
    content: string;
    images: string[];
  };
  enableWhatsappCheckout: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  coupons?: Coupon[];
  privacyPolicy?: string;
  youtubeUrl?: string;
}

const StoreSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>({ ...defaultStoreSettings } as StoreSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [shareImage, setShareImage] = useState<File | null>(null);
  const [sharePreview, setSharePreview] = useState<string>('');
  const [aboutUsImage1, setAboutUsImage1] = useState<File | null>(null);
  const [aboutUsImage1Preview, setAboutUsImage1Preview] = useState<string>('');
  const [aboutUsImage2, setAboutUsImage2] = useState<File | null>(null);
  const [aboutUsImage2Preview, setAboutUsImage2Preview] = useState<string>('');
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const storedCoupons = localStorage.getItem('storeCoupons');
    console.log('Cupons carregados:', storedCoupons);
    return storedCoupons ? JSON.parse(storedCoupons) : [];
  });
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
    loadSettingsPHP();
    // Adicionar listener para atualização do storage
    window.addEventListener('storage', loadSettings);
    window.addEventListener('storeSettingsUpdated', loadSettings);

    return () => {
      window.removeEventListener('storage', loadSettings);
      window.removeEventListener('storeSettingsUpdated', loadSettings);
    };
  }, []);

  // Salvar as configurações
  const saveSettings = async () => {
    setSaving(true);
    try {
      console.log('Salvar configurações:', settings);
      await saveStoreSettings(settings);
      await phpserver().updateStoreSettings(JSON.stringify(settings));
      showToast.success('Configurações salvas com sucesso!');
      setTimeout(() => {
        window.location.reload();
      }, 1e3)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showToast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };
  const loadSettingsPHP = async () => {
    try {
      phpserver().getStoreSettings().then((response) => {
        localStorage.setItem('storeSettings', JSON.stringify(response));
        loadSettings();
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showToast.error('Erro ao carregar configurações');
    }
  }
  // Handler para alterações em configurações
  const handleSettingChange = (path: string, value: any) => {
    const newSettings = { ...settings };
    console.log('Novas configurações:', newSettings);
    // Dividir o caminho em partes (exemplo: "socialMedia.instagram.enabled" -> ["socialMedia", "instagram", "enabled"])
    const parts = path.split('.');

    // Navegar pela estrutura de configurações para atualizar o valor
    let current = newSettings;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    console.log('Configurações atualizadas:', newSettings);
    setSettings(newSettings);
    // saveStoreSettings(newSettings).then(() => {
    //   console.log(`Configuração ${path} atualizada para:`, value);
    //   // Disparar evento personalizado para notificar outras partes da aplicação
    //   window.dispatchEvent(new CustomEvent('storeSettingsUpdated'));
    // });
  };

  // Handler para upload de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      handleSettingChange('logoImage', imageUrl);
      showToast.success('Logo carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
      showToast.error('Erro ao carregar logo');
    }
  };

  // Handler para upload de banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      handleSettingChange('bannerConfig.imageUrl', imageUrl);
      showToast.success('Banner carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar banner:', error);
      showToast.error('Erro ao carregar banner');
    }
  };

  // Handler para upload de imagem de compartilhamento
  const handleShareImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      handleSettingChange('shareImage', imageUrl);
      showToast.success('Imagem de compartilhamento carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar imagem de compartilhamento:', error);
      showToast.error('Erro ao carregar imagem de compartilhamento');
    }
  };

  // Handler for About Us image uploads
  const handleAboutUsImage1Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      const newImages = [...(settings.aboutUs?.images || [])];
      newImages[0] = imageUrl;
      handleSettingChange('aboutUs.images', newImages);
      showToast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      showToast.error('Erro ao carregar imagem');
    }
  };

  const handleAboutUsImage2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      const newImages = [...(settings.aboutUs?.images || [])];
      newImages[1] = imageUrl;
      handleSettingChange('aboutUs.images', newImages);
      showToast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      showToast.error('Erro ao carregar imagem');
    }
  };

  // Carregar configurações
  const loadSettings = async () => {
    setLoading(true);
    try {
      const storedSettings = getStoreSettings();
      console.log('Configurações carregadas:', storedSettings);
      setSettings(storedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showToast.error('Não foi possível carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = () => {
    if (!newCouponCode.trim() || !newCouponDiscount.trim()) {
      showToast.error('Por favor, preencha todos os campos do cupom');
      return;
    }

    const discount = parseFloat(newCouponDiscount);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      showToast.error('O desconto deve ser um número entre 1 e 100');
      return;
    }

    const couponExists = coupons.some(c => c.code === newCouponCode.toUpperCase());
    if (couponExists) {
      showToast.error('Este código de cupom já existe');
      return;
    }

    const newCoupon: Coupon = {
      code: newCouponCode.toUpperCase(),
      discount: discount
    };

    const updatedCoupons = [...coupons, newCoupon];
    setCoupons(updatedCoupons);
    localStorage.setItem('storeCoupons', JSON.stringify(updatedCoupons));

    setNewCouponCode('');
    setNewCouponDiscount('');
    showToast.success('Cupom adicionado com sucesso!');
  };

  const handleRemoveCoupon = (code: string) => {
    const updatedCoupons = coupons.filter(c => c.code !== code);
    setCoupons(updatedCoupons);
    localStorage.setItem('storeCoupons', JSON.stringify(updatedCoupons));
    showToast.success('Cupom removido com sucesso!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Configurações da Loja</h2>
        <Button
          onClick={saveSettings}
          className="bg-shop-red hover:bg-shop-red/90"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <div className="bg-white p-2 sm:p-6 rounded-lg shadow-sm">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full flex flex-wrap justify-start mb-6 overflow-x-auto pb-2 gap-1">
            <TabsTrigger value="general" className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <Store className="mr-1 h-5 w-5" />
              <span className="hidden xs:inline">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <Paintbrush className="mr-1 h-5 w-5" />
              <span className="hidden xs:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <Menu className="mr-1 h-5 w-5" />
              <span className="hidden xs:inline">Navegação</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <Share2 className="mr-1 h-5 w-5" />
              <span className="hidden xs:inline">Redes Sociais</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <Folder className="mr-1 h-5 w-5" />
              <span className="hidden xs:inline">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <CreditCard className="mr-1 h-5 w-5" />
              <span className="hidden xs:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="store" className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
              <Store className="mr-1 h-5 w-5" />
              <span className="hidden xs:inline">Quem Somos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Loja</CardTitle>
                <CardDescription>Configure as informações básicas da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nome da Loja</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName || ''}
                      onChange={(e) => handleSettingChange('storeName', e.target.value)}
                      placeholder="Nome da sua loja"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtubeUrl">Link do YouTube</Label>
                    <Input
                      id="youtubeUrl"
                      value={settings.youtubeUrl || ''}
                      onChange={(e) => handleSettingChange('youtubeUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-gray-500">Cole aqui o link do vídeo do YouTube da sua loja</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeNameFont">Fonte do Nome</Label>
                    <select
                      id="storeNameFont"
                      value={settings.storeNameFont || 'Arial, sans-serif'}
                      onChange={(e) => handleSettingChange('storeNameFont', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="Tahoma, sans-serif">Tahoma</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeNameColor">Cor do Nome</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="storeNameColor"
                        type="color"
                        value={settings.storeNameColor || '#000000'}
                        onChange={(e) => handleSettingChange('storeNameColor', e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.storeNameColor || '#000000'}
                        onChange={(e) => handleSettingChange('storeNameColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeNameSize">Tamanho do Nome</Label>
                    <select
                      id="storeNameSize"
                      value={settings.storeNameSize || '24px'}
                      onChange={(e) => handleSettingChange('storeNameSize', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="16px">Pequeno (16px)</option>
                      <option value="24px">Médio (24px)</option>
                      <option value="32px">Grande (32px)</option>
                      <option value="40px">Muito Grande (40px)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pageTitle">Título da Página</Label>
                    <Input
                      id="pageTitle"
                      value={settings.pageTitle || ''}
                      onChange={(e) => handleSettingChange('pageTitle', e.target.value)}
                      placeholder="Título que aparecerá na página inicial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pageTitleFont">Fonte do Título</Label>
                    <select
                      id="pageTitleFont"
                      value={settings.pageTitleFont || 'Arial, sans-serif'}
                      onChange={(e) => handleSettingChange('pageTitleFont', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="Helvetica, sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="Tahoma, sans-serif">Tahoma</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pageTitleColor">Cor do Título</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="pageTitleColor"
                        type="color"
                        value={settings.pageTitleColor || '#000000'}
                        onChange={(e) => handleSettingChange('pageTitleColor', e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={settings.pageTitleColor || '#000000'}
                        onChange={(e) => handleSettingChange('pageTitleColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pageTitleSize">Tamanho do Título</Label>
                    <select
                      id="pageTitleSize"
                      value={settings.pageTitleSize || '24px'}
                      onChange={(e) => handleSettingChange('pageTitleSize', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="16px">Pequeno (16px)</option>
                      <option value="24px">Médio (24px)</option>
                      <option value="32px">Grande (32px)</option>
                      <option value="40px">Muito Grande (40px)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pageSubtitle">Subtítulo da Página</Label>
                  <Input
                    id="pageSubtitle"
                    value={settings.pageSubtitle || ''}
                    onChange={(e) => handleSettingChange('pageSubtitle', e.target.value)}
                    placeholder="Subtítulo que aparecerá na página inicial"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Configure as informações de contato da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Telefone</Label>
                  <Input
                    id="storePhone"
                    value={settings.storePhone || ''}
                    onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mapLink">Link do Mapa</Label>
                  <Input
                    id="mapLink"
                    value={settings.mapLink || ''}
                    onChange={(e) => handleSettingChange('mapLink', e.target.value)}
                    placeholder="https://maps.google.com/?q=Seu+Endereço"
                  />
                  <p className="text-xs text-gray-500">Este link será usado no botão "Ver Mapa" na página principal</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText">Texto do Rodapé</Label>
                  <Textarea
                    id="footerText"
                    value={settings.footerText || ''}
                    onChange={(e) => handleSettingChange('footerText', e.target.value)}
                    placeholder="© 2024 Minha Loja - Todos os direitos reservados"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card de Política de Privacidade */}
            <Card>
              <CardHeader>
                <CardTitle>Política de Privacidade</CardTitle>
                <CardDescription>Edite o texto da política de privacidade exibida no site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  value={settings.privacyPolicy || ''}
                  onChange={e => handleSettingChange('privacyPolicy', e.target.value)}
                  rows={8}
                  placeholder="Digite aqui a política de privacidade da loja..."
                />
                <Button onClick={saveSettings} className="mt-2">Salvar Política</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo e Imagens</CardTitle>
                <CardDescription>Configure o logo e as imagens da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-auto">
                <div className="space-y-2">
                  <Label htmlFor="logoUpload">Logo da Loja</Label>
                  <div className="flex items-center gap-4">
                    {(logoPreview || settings.logoImage) && (
                      <div className="relative w-24 h-24 border rounded">
                        <img
                          src={logoPreview || settings.logoImage}
                          alt="Logo preview"
                          className="object-contain w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 text-white"
                          onClick={() => {
                            setLogoImage(null);
                            setLogoPreview('');
                            handleSettingChange('logoImage', '');
                          }}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}

                    <div>
                      <Input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logoUpload')?.click()}
                      >
                        <Upload size={16} className="mr-2" />
                        Enviar Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerUpload">Imagem do Banner</Label>
                  <div className="flex items-center gap-4">
                    {(bannerPreview || (settings.bannerConfig && settings.bannerConfig.imageUrl)) && (
                      <div className="relative w-48 h-24 border rounded">
                        <img
                          src={bannerPreview || (settings.bannerConfig && settings.bannerConfig.imageUrl)}
                          alt="Banner preview"
                          className="object-cover w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 text-white"
                          onClick={() => {
                            setBannerImage(null);
                            setBannerPreview('');
                            if (settings.bannerConfig) {
                              const newBanner = { ...settings.bannerConfig, imageUrl: '' };
                              handleSettingChange('bannerConfig', newBanner);
                            }
                          }}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}

                    <div>
                      <Input
                        id="bannerUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('bannerUpload')?.click()}
                      >
                        <Upload size={16} className="mr-2" />
                        Enviar Banner
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardContent className="space-y-4 overflow-x-auto">
                <div className="space-y-2">
                  <Label htmlFor="logoUpload">Título da Loja</Label>
                  <Input
                    id="title"
                    value={settings.title || ''}
                    onChange={(e) => handleSettingChange('title', e.target.value)}
                    placeholder="Título da Loja"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUpload">Subtítulo da Loja</Label>
                  <Input
                    id="subtitle"
                    value={settings.subTitle || ''}
                    onChange={(e) => handleSettingChange('subTitle', e.target.value)}
                    placeholder="Subtítulo da Loja"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Links de Navegação</CardTitle>
                <CardDescription>Configure os links que aparecerão no menu superior da loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="novidades"
                        checked={settings.headerLinks?.novidades || false}
                        onCheckedChange={(value) => handleSettingChange('headerLinks.novidades', !!value)}
                      />
                      <Label htmlFor="novidades">Novidades</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="masculino"
                        checked={settings.headerLinks?.masculino || false}
                        onCheckedChange={(value) => handleSettingChange('headerLinks.masculino', !!value)}
                      />
                      <Label htmlFor="masculino">Masculino</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feminino"
                        checked={settings.headerLinks?.feminino || false}
                        onCheckedChange={(value) => handleSettingChange('headerLinks.feminino', !!value)}
                      />
                      <Label htmlFor="feminino">Feminino</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="kids"
                        checked={settings.headerLinks?.kids || false}
                        onCheckedChange={(value) => handleSettingChange('headerLinks.kids', !!value)}
                      />
                      <Label htmlFor="kids">Kids</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="calcados"
                        checked={settings.headerLinks?.calcados || false}
                        onCheckedChange={(value) => handleSettingChange('headerLinks.calcados', !!value)}
                      />
                      <Label htmlFor="calcados">Calçados</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acessorios"
                        checked={settings.headerLinks?.acessorios || false}
                        onCheckedChange={(value) => handleSettingChange('headerLinks.acessorios', !!value)}
                      />
                      <Label htmlFor="acessorios">Acessórios</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="off"
                        checked={settings.headerLinks?.off || false}
                        onCheckedChange={(value) => handleSettingChange('headerLinks.off', !!value)}
                      />
                      <Label htmlFor="off">Ofertas</Label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Cores do Menu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="headerColor">Cor de Fundo do Menu</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="headerColor"
                          type="color"
                          value={settings.headerColor || '#FFFFFF'}
                          onChange={(e) => handleSettingChange('headerColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={settings.headerColor || '#FFFFFF'}
                          onChange={(e) => handleSettingChange('headerColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="headerLinkColor">Cor dos Links do Menu</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="headerLinkColor"
                          type="color"
                          value={settings.headerLinkColor || '#000000'}
                          onChange={(e) => handleSettingChange('headerLinkColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={settings.headerLinkColor || '#000000'}
                          onChange={(e) => handleSettingChange('headerLinkColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Links Personalizados</h3>
                  <p className="text-sm text-gray-500 mb-2">Adicione links personalizados ao menu principal</p>

                  {settings.headerLinks?.customLinks?.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Checkbox
                        id={`custom-link-${index}`}
                        checked={link.enabled}
                        onCheckedChange={(value) => {
                          const newCustomLinks = [...settings.headerLinks.customLinks];
                          newCustomLinks[index].enabled = !!value;
                          handleSettingChange('headerLinks.customLinks', newCustomLinks);
                        }}
                      />
                      <Input
                        placeholder="Nome do Link"
                        value={link.label}
                        onChange={(e) => {
                          const newCustomLinks = [...settings.headerLinks.customLinks];
                          newCustomLinks[index].label = e.target.value;
                          handleSettingChange('headerLinks.customLinks', newCustomLinks);
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newCustomLinks = [...settings.headerLinks.customLinks];
                          newCustomLinks.splice(index, 1);
                          handleSettingChange('headerLinks.customLinks', newCustomLinks);
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      const newCustomLinks = [...(settings.headerLinks?.customLinks || [])];
                      newCustomLinks.push({ label: 'Novo Link', enabled: true });
                      handleSettingChange('headerLinks.customLinks', newCustomLinks);
                    }}
                  >
                    Adicionar Link Personalizado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Configure as redes sociais que serão exibidas no rodapé da loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableSocialMedia"
                    checked={settings.socialMedia?.enabled || false}
                    onCheckedChange={(value) => handleSettingChange('socialMedia.enabled', !!value)}
                  />
                  <Label htmlFor="enableSocialMedia">Exibir redes sociais no rodapé</Label>
                </div>

                {/* Instagram */}
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableInstagram"
                      checked={settings.socialMedia?.instagram?.enabled || false}
                      onCheckedChange={(value) => handleSettingChange('socialMedia.instagram.enabled', !!value)}
                    />
                    <Label htmlFor="enableInstagram">Instagram</Label>
                  </div>
                  <Input
                    placeholder="URL do Instagram"
                    value={settings.socialMedia?.instagram?.url || ''}
                    onChange={(e) => handleSettingChange('socialMedia.instagram.url', e.target.value)}
                  />
                </div>

                {/* Facebook */}
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableFacebook"
                      checked={settings.socialMedia?.facebook?.enabled || false}
                      onCheckedChange={(value) => handleSettingChange('socialMedia.facebook.enabled', !!value)}
                    />
                    <Label htmlFor="enableFacebook">Facebook</Label>
                  </div>
                  <Input
                    placeholder="URL do Facebook"
                    value={settings.socialMedia?.facebook?.url || ''}
                    onChange={(e) => handleSettingChange('socialMedia.facebook.url', e.target.value)}
                  />
                </div>

                {/* WhatsApp */}
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableWhatsApp"
                      checked={settings.socialMedia?.whatsapp?.enabled || false}
                      onCheckedChange={(value) => handleSettingChange('socialMedia.whatsapp.enabled', !!value)}
                    />
                    <Label htmlFor="enableWhatsApp">WhatsApp</Label>
                  </div>
                  <Input
                    placeholder="URL do WhatsApp (ex: https://wa.me/5511999999999)"
                    value={settings.socialMedia?.whatsapp?.url || ''}
                    onChange={(e) => handleSettingChange('socialMedia.whatsapp.url', e.target.value)}
                  />
                </div>

                {/* TikTok */}
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableTikTok"
                      checked={settings.socialMedia?.tiktok?.enabled || false}
                      onCheckedChange={(value) => handleSettingChange('socialMedia.tiktok.enabled', !!value)}
                    />
                    <Label htmlFor="enableTikTok">TikTok</Label>
                  </div>
                  <Input
                    placeholder="URL do TikTok"
                    value={settings.socialMedia?.tiktok?.url || ''}
                    onChange={(e) => handleSettingChange('socialMedia.tiktok.url', e.target.value)}
                  />
                </div>

                {/* Twitter */}
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableTwitter"
                      checked={settings.socialMedia?.twitter?.enabled || false}
                      onCheckedChange={(value) => handleSettingChange('socialMedia.twitter.enabled', !!value)}
                    />
                    <Label htmlFor="enableTwitter">Twitter/X</Label>
                  </div>
                  <Input
                    placeholder="URL do Twitter/X"
                    value={settings.socialMedia?.twitter?.url || ''}
                    onChange={(e) => handleSettingChange('socialMedia.twitter.url', e.target.value)}
                  />
                </div>

                {/* Website */}
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableWebsite"
                      checked={settings.socialMedia?.website?.enabled || false}
                      onCheckedChange={(value) => handleSettingChange('socialMedia.website.enabled', !!value)}
                    />
                    <Label htmlFor="enableWebsite">Website</Label>
                  </div>
                  <Input
                    placeholder="URL do website"
                    value={settings.socialMedia?.website?.url || ''}
                    onChange={(e) => handleSettingChange('socialMedia.website.url', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Categorias</CardTitle>
                <CardDescription>Configure as categorias de produtos da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-auto">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableCategories"
                      checked={settings.categoryHighlights?.enabled || false}
                      onCheckedChange={(value) => handleSettingChange('categoryHighlights.enabled', !!value)}
                    />
                    <Label htmlFor="enableCategories">Exibir categorias em destaque na página inicial</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryTitle">Título da Seção de Categorias</Label>
                    <Input
                      id="categoryTitle"
                      placeholder="Categorias em Destaque"
                      value={settings.categoryHighlights?.title || ''}
                      onChange={(e) => handleSettingChange('categoryHighlights.title', e.target.value)}
                    />
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-3">Categorias Existentes</h3>

                    <div className="space-y-4">
                      {settings.categoryHighlights?.categories?.map((category, index) => (
                        <div key={index} className="border rounded-md p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{category.name || 'Nova Categoria'}</h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newCategories = [...(settings.categoryHighlights?.categories || [])];
                                newCategories.splice(index, 1);
                                handleSettingChange('categoryHighlights.categories', newCategories);
                              }}
                            >
                              <X size={16} />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`category-name-${index}`}>Nome da Categoria</Label>
                            <Input
                              id={`category-name-${index}`}
                              value={category.name || ''}
                              onChange={(e) => {
                                const newCategories = [...(settings.categoryHighlights?.categories || [])];
                                newCategories[index] = {
                                  ...newCategories[index],
                                  name: e.target.value
                                };
                                handleSettingChange('categoryHighlights.categories', newCategories);
                              }}
                              placeholder="Ex: Feminino, Masculino, etc."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`category-link-${index}`}>Link da Categoria</Label>
                            <div className="flex">
                              <div className="bg-gray-100 flex items-center px-3 border border-r-0 rounded-l-md text-gray-500">
                                /products/
                              </div>
                              <Input
                                id={`category-link-${index}`}
                                value={category.link.replace('/products/', '')}
                                onChange={(e) => {
                                  const newCategories = [...(settings.categoryHighlights?.categories || [])];
                                  newCategories[index] = {
                                    ...newCategories[index],
                                    link: `/products/${e.target.value}`
                                  };
                                  handleSettingChange('categoryHighlights.categories', newCategories);
                                }}
                                placeholder="nome-da-categoria"
                                className="rounded-l-none"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Informe apenas a parte final do link. Cada categoria deve ter um link único.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`category-image-${index}`}>Imagem da Categoria</Label>
                            <div className="flex items-center gap-4">
                              {category.image && (
                                <div className="relative w-16 h-16 border rounded">
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              )}
                              <div className="flex gap-2 flex-1">
                                <Input
                                  id={`category-image-${index}`}
                                  value={category.image || ''}
                                  onChange={(e) => {
                                    const newCategories = [...(settings.categoryHighlights?.categories || [])];
                                    newCategories[index] = { ...newCategories[index], image: e.target.value };
                                    handleSettingChange('categoryHighlights.categories', newCategories);
                                  }}
                                  placeholder="URL da imagem"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = async (e) => {
                                      const target = e.target as HTMLInputElement;
                                      if (target.files && target.files[0]) {
                                        try {
                                          showToast.loading('Enviando imagem...');
                                          const imageUrl = await handleImageUpload(target.files[0]);
                                          const newCategories = [...(settings.categoryHighlights?.categories || [])];
                                          newCategories[index] = { ...newCategories[index], image: imageUrl };
                                          handleSettingChange('categoryHighlights.categories', newCategories);
                                          showToast.success('Imagem enviada com sucesso');
                                        } catch (error) {
                                          console.error('Erro ao enviar imagem:', error);
                                          showToast.error('Erro ao enviar imagem');
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  <Upload size={16} className="mr-1" />
                                  Upload
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        const newCategories = [...(settings.categoryHighlights?.categories || [])];
                        const newCategoryName = 'Nova Categoria';
                        // Gerar um ID único para evitar duplicação de links
                        const timestamp = new Date().getTime();
                        newCategories.push({
                          name: newCategoryName,
                          image: '',
                          link: `/products/categoria-${timestamp}`
                        });
                        handleSettingChange('categoryHighlights.categories', newCategories);
                      }}
                    >
                      Adicionar Nova Categoria
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
                <CardDescription>Configure as formas de pagamento aceitas pela sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showPaymentMethods"
                      checked={settings.showPaymentMethods || false}
                      onCheckedChange={(value) => handleSettingChange('showPaymentMethods', !!value)}
                    />
                    <Label htmlFor="showPaymentMethods">Exibir formas de pagamento</Label>
                  </div>

                  {!settings.storePhone && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-yellow-800 text-sm">
                      <p className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Para habilitar as opções de pagamento, adicione um número de telefone na aba <strong>Geral</strong>.
                      </p>
                      <Button
                        variant="link"
                        className="text-yellow-800 p-0 h-auto mt-1 text-sm font-medium"
                        onClick={() => {
                          const generalTab = document.querySelector('[value="general"]') as HTMLElement;
                          if (generalTab) generalTab.click();
                        }}
                      >
                        Ir para configurações gerais
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="creditCardPayment"
                          checked={settings.activePaymentMethods?.credit || false}
                          onCheckedChange={(value) => handleSettingChange('activePaymentMethods.credit', !!value)}
                          disabled={!settings.storePhone}
                        />
                        <Label htmlFor="creditCardPayment" className={!settings.storePhone ? "text-gray-400" : ""}>
                          Cartão de Crédito
                        </Label>
                      </div>
                      {settings.activePaymentMethods?.credit && settings.storePhone && (
                        <div className="mt-2 text-sm text-gray-500">
                          Pagamentos por cartão de crédito via {settings.storePhone}
                        </div>
                      )}
                    </div>

                    <div className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="debitCardPayment"
                          checked={settings.activePaymentMethods?.debit || false}
                          onCheckedChange={(value) => handleSettingChange('activePaymentMethods.debit', !!value)}
                          disabled={!settings.storePhone}
                        />
                        <Label htmlFor="debitCardPayment" className={!settings.storePhone ? "text-gray-400" : ""}>
                          Cartão de Débito
                        </Label>
                      </div>
                      {settings.activePaymentMethods?.debit && settings.storePhone && (
                        <div className="mt-2 text-sm text-gray-500">
                          Pagamentos por cartão de débito via {settings.storePhone}
                        </div>
                      )}
                    </div>

                    <div className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pixPayment"
                          checked={settings.activePaymentMethods?.pix || false}
                          onCheckedChange={(value) => handleSettingChange('activePaymentMethods.pix', !!value)}
                          disabled={!settings.storePhone}
                        />
                        <Label htmlFor="pixPayment" className={!settings.storePhone ? "text-gray-400" : ""}>
                          PIX
                        </Label>
                      </div>
                      {settings.activePaymentMethods?.pix && settings.storePhone && (
                        <div className="mt-2 text-sm text-gray-500">
                          Chave PIX: {settings.storePhone}
                        </div>
                      )}
                    </div>

                    <div className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cashPayment"
                          checked={settings.activePaymentMethods?.cash || false}
                          onCheckedChange={(value) => handleSettingChange('activePaymentMethods.cash', !!value)}
                          disabled={!settings.storePhone}
                        />
                        <Label htmlFor="cashPayment" className={!settings.storePhone ? "text-gray-400" : ""}>
                          Dinheiro
                        </Label>
                      </div>
                      {settings.activePaymentMethods?.cash && settings.storePhone && (
                        <div className="mt-2 text-sm text-gray-500">
                          Confirme disponibilidade pelo telefone: {settings.storePhone}
                        </div>
                      )}
                    </div>

                    <div className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="otherPayment"
                          checked={settings.activePaymentMethods?.other || false}
                          onCheckedChange={(value) => handleSettingChange('activePaymentMethods.other', !!value)}
                          disabled={!settings.storePhone}
                        />
                        <Label htmlFor="otherPayment" className={!settings.storePhone ? "text-gray-400" : ""}>
                          Outras formas
                        </Label>
                      </div>
                      {settings.activePaymentMethods?.other && settings.storePhone && (
                        <div className="mt-2 text-sm text-gray-500">
                          Para mais informações sobre outras formas de pagamento, entre em contato: {settings.storePhone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-200 pt-4 mt-4">
                    <h3 className="font-medium">Integração com WhatsApp</h3>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enableWhatsappCheckout"
                          checked={settings.enableWhatsappCheckout || false}
                          onCheckedChange={(value) => handleSettingChange('enableWhatsappCheckout', !!value)}
                          disabled={!settings.storePhone}
                        />
                        <Label htmlFor="enableWhatsappCheckout" className={!settings.storePhone ? "text-gray-400" : ""}>
                          Habilitar checkout via WhatsApp
                        </Label>
                      </div>

                      <div className="text-sm text-gray-500 mb-3">
                        Ao finalizar a compra, será aberto o WhatsApp com os detalhes dos produtos no carrinho.
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsappNumber" className={!settings.storePhone ? "text-gray-400" : ""}>
                          Número do WhatsApp para Pedidos
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="whatsappNumber"
                            placeholder="Ex: 5511999999999 (com código do país)"
                            value={settings.whatsappNumber || ''}
                            onChange={(e) => handleSettingChange('whatsappNumber', e.target.value)}
                            disabled={!settings.storePhone}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            className="flex-shrink-0"
                            onClick={() => {
                              // Formatar número de telefone da loja para WhatsApp
                              if (settings.storePhone) {
                                const phone = settings.storePhone.replace(/\D/g, '');
                                const whatsappFormat = phone.length > 9 ? `55${phone}` : phone;
                                handleSettingChange('whatsappNumber', whatsappFormat);
                              }
                            }}
                            disabled={!settings.storePhone}
                          >
                            Usar telefone da loja
                          </Button>
                        </div>
                        {!settings.storePhone && (
                          <p className="text-xs text-gray-500 mt-1">
                            Adicione um número de telefone na aba Geral para habilitar esta opção
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsappMessage" className={!settings.enableWhatsappCheckout ? "text-gray-400" : ""}>
                          Mensagem padrão (opcional)
                        </Label>
                        <Textarea
                          id="whatsappMessage"
                          placeholder="Olá, gostaria de finalizar minha compra..."
                          value={settings.whatsappMessage || ''}
                          onChange={(e) => handleSettingChange('whatsappMessage', e.target.value)}
                          rows={3}
                          disabled={!settings.enableWhatsappCheckout || !settings.storePhone}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryInfo" className={!settings.storePhone ? "text-gray-400" : ""}>
                      Informações de Entrega
                    </Label>
                    <Textarea
                      id="deliveryInfo"
                      placeholder="Informe as políticas de entrega da sua loja"
                      value={settings.deliveryInfo || ''}
                      onChange={(e) => handleSettingChange('deliveryInfo', e.target.value)}
                      rows={3}
                      disabled={!settings.storePhone}
                    />
                    {!settings.storePhone && (
                      <p className="text-xs text-gray-500 mt-1">
                        Adicione um número de telefone na aba Geral para habilitar esta opção
                      </p>
                    )}
                  </div>
                </div>

                {/* Coupon Management Section */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Gerenciamento de Cupons</h3>

                  {/* Add New Coupon Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="couponCode">Código do Cupom</Label>
                      <Input
                        id="couponCode"
                        placeholder="Ex: DESCONTO10"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="couponDiscount">Desconto (%)</Label>
                      <Input
                        id="couponDiscount"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Ex: 10"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddCoupon}
                    className="mb-6"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar Cupom
                  </Button>

                  {/* Coupons List */}
                  {coupons.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-500">Cupons Ativos</h4>
                      <div className="border rounded-md divide-y">
                        {coupons.map((coupon) => (
                          <div key={coupon.code} className="flex items-center justify-between p-3">
                            <div>
                              <span className="font-medium">{coupon.code}</span>
                              <span className="text-gray-500 ml-2">-{coupon.discount}%</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCoupon(coupon.code)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum cupom cadastrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store" className="space-y-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5" /> Informações da Loja
                </CardTitle>
                <CardDescription>
                  Configure a página "Quem Somos" da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aboutUsEnabled"
                    checked={settings.aboutUs?.enabled || false}
                    onCheckedChange={(checked) =>
                      handleSettingChange('aboutUs.enabled', checked)
                    }
                  />
                  <Label htmlFor="aboutUsEnabled">
                    Mostrar link "Quem Somos" no cabeçalho
                  </Label>
                </div>

                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="aboutUsTitle">Título da página</Label>
                    <Input
                      id="aboutUsTitle"
                      placeholder="Quem Somos"
                      value={settings.aboutUs?.title || ''}
                      onChange={(e) => handleSettingChange('aboutUs.title', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="aboutUsContent">Conteúdo</Label>
                    <Textarea
                      id="aboutUsContent"
                      placeholder="Fale sobre sua loja, história, missão, visão e valores..."
                      value={settings.aboutUs?.content || ''}
                      onChange={(e) => handleSettingChange('aboutUs.content', e.target.value)}
                      className="mt-1 min-h-[200px]"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Use linhas em branco para criar parágrafos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="aboutUsImage1">Imagem Principal</Label>
                      <div className="mt-1 flex flex-col items-center justify-center">
                        {settings.aboutUs?.images?.[0] && (
                          <div className="relative mb-2 w-full h-40 overflow-hidden rounded-md">
                            <img
                              src={settings.aboutUs.images[0]}
                              alt="Imagem principal"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                const newImages = [...(settings.aboutUs?.images || [])];
                                newImages[0] = '';
                                handleSettingChange('aboutUs.images', newImages);
                              }}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                              type="button"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        <Label
                          htmlFor="aboutUsImage1Upload"
                          className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-center py-2 px-4 rounded border-2 border-dashed border-gray-300"
                        >
                          <Upload className="h-4 w-4 inline mr-2" />
                          {settings.aboutUs?.images?.[0] ? 'Trocar imagem' : 'Carregar imagem'}
                        </Label>
                        <Input
                          id="aboutUsImage1Upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAboutUsImage1Upload}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Recomendado: 500x500 pixels
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="aboutUsImage2">Segunda Imagem</Label>
                      <div className="mt-1 flex flex-col items-center justify-center">
                        {settings.aboutUs?.images?.[1] && (
                          <div className="relative mb-2 w-full h-40 overflow-hidden rounded-md">
                            <img
                              src={settings.aboutUs.images[1]}
                              alt="Segunda imagem"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                const newImages = [...(settings.aboutUs?.images || [])];
                                newImages[1] = '';
                                handleSettingChange('aboutUs.images', newImages);
                              }}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                              type="button"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        <Label
                          htmlFor="aboutUsImage2Upload"
                          className="w-full cursor-pointer bg-gray-100 hover:bg-gray-200 text-center py-2 px-4 rounded border-2 border-dashed border-gray-300"
                        >
                          <Upload className="h-4 w-4 inline mr-2" />
                          {settings.aboutUs?.images?.[1] ? 'Trocar imagem' : 'Carregar imagem'}
                        </Label>
                        <Input
                          id="aboutUsImage2Upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAboutUsImage2Upload}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Recomendado: 500x500 pixels
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200">
                  <p className="mb-2">
                    <strong>Dicas:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>As imagens serão exibidas como um carrossel no final da página</li>
                    <li>Use imagens quadradas (500x500 pixels) para melhor exibição</li>
                    <li>O link "Quem Somos" será exibido como primeiro item no menu quando ativado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StoreSettings;
