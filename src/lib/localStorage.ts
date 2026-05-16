// localStorage.ts - Functions to handle store settings using localStorage
import phpserver from "@/lib/phpserver";
// Default store settings with social media configuration
export const defaultStoreSettings = {
  storeName: 'TACO',
  title: 'Esse é o Título de Teste',
  subTitle: 'Esse é o Sub-Título de Teste',
  storeNameFont: 'Arial, sans-serif',
  storeNameColor: '#000000',
  storeNameSize: '24px',
  pageTitle: 'Bem-vindo à TACO',
  pageTitleFont: 'Arial, sans-serif',
  pageTitleColor: '#000000',
  pageTitleSize: '24px',
  pageSubtitle: 'Av. Paulista, 1000 - São Paulo, SP | Tel: (11) 9999-9999',
  logoImage: '',
  mapLink: 'https://maps.google.com/?q=Av.+Paulista,+1000,+São+Paulo',
  shareImage: '',
  footerText: '© 2025 TACO. Todos os direitos reservados.',
  deliveryInfo: 'Frete grátis para compras acima de R$ 199,90. Consulte o prazo estimado de entrega informando seu CEP.',
  showPaymentMethods: true,
  storePhone: '(11) 9999-9999',
  activePaymentMethods: {
    credit: true,
    debit: true,
    pix: true,
    cash: true,
    other: true
  },
  enableWhatsappCheckout: false,
  whatsappNumber: '',
  whatsappMessage: '',
  bannerConfig: {
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop',
    title: 'Nova Coleção 2024',
    subtitle: 'Descubra as últimas tendências em roupas e calçados para todas as estações',
    showExploreButton: true,
    textColor: '#FFFFFF',
    buttonColor: '#EF4444'
  },
  headerLinks: {
    novidades: true,
    masculino: true,
    feminino: true,
    kids: true,
    calcados: true,
    acessorios: true,
    off: true,
    customLinks: []
  },
  headerColor: '#FFFFFF',
  headerLinkColor: '#000000',
  categoryHighlights: {
    enabled: true,
    title: 'Categorias em Destaque',
    categories: [
      {
        name: "Feminino",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop",
        link: "/products/feminino"
      },
      {
        name: "Masculino",
        image: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?w=800&auto=format&fit=crop",
        link: "/products/masculino"
      },
      {
        name: "Kids",
        image: "https://images.unsplash.com/photo-1519238359922-989348752efb?w=800&auto=format&fit=crop",
        link: "/products/kids"
      },
      {
        name: "Acessórios",
        image: "https://images.unsplash.com/photo-1625591341337-13156895c604?w=800&auto=format&fit=crop",
        link: "/products/acessórios"
      }
    ]
  },
  aboutUs: {
    enabled: false,
    title: 'Quem Somos',
    content: 'Nossa loja tem como missão oferecer produtos de alta qualidade a preços acessíveis. Fundada em 2010, crescemos com o compromisso de proporcionar a melhor experiência de compra para nossos clientes.\n\nTrabalhos com as melhores marcas e estamos sempre atentos às tendências da moda para trazer o que há de mais moderno para você.\n\nNosso time é formado por profissionais apaixonados por moda e dedicados a garantir sua satisfação.',
    images: []
  },
  socialMedia: {
    enabled: true,
    instagram: {
      enabled: true,
      url: 'https://instagram.com/tacoficial'
    },
    facebook: {
      enabled: true,
      url: 'https://facebook.com/tacoficial'
    },
    whatsapp: {
      enabled: true,
      url: 'https://wa.me/5521999999999'
    },
    tiktok: {
      enabled: true,
      url: 'https://tiktok.com/@tacoficial'
    },
    twitter: {
      enabled: true,
      url: 'https://twitter.com/tacoficial'
    },
    website: {
      enabled: true,
      url: 'https://taco.com.br'
    }
  }
};

// Helper function for deep merging objects (handles nested objects)
export const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (isObject(targetValue) && isObject(sourceValue)) {
        output[key] = deepMerge(targetValue, sourceValue);
      } else {
        output[key] = sourceValue;
      }
    });
    Object.keys(source).forEach(key => {
      if (!target.hasOwnProperty(key)) {
        output[key] = source[key];
      }
    });
  }

  return output;
};

// Get settings from localStorage
export const getStoreSettings = () => {
  try {
    var storedSettings = localStorage.getItem('storeSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      console.log('Configurações carregadas no deepMerge:', parsedSettings);
      return deepMerge(defaultStoreSettings, parsedSettings);
    }
    return { ...defaultStoreSettings };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return { ...defaultStoreSettings };
  }
};

// Save settings to localStorage
export const saveStoreSettings = async (settings: any) => {
  try {
    localStorage.setItem('storeSettings', JSON.stringify(settings));

    // Dispatch a storage event so other components can update
    window.dispatchEvent(new Event('storage'));
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return { error };
  }
};

// Helper to handle image uploads
export const handleImageUpload = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// Reset settings to default
export const resetStoreSettings = () => {
  try {
    localStorage.setItem('storeSettings', JSON.stringify(defaultStoreSettings));
    // Dispatch a storage event so other components can update
    window.dispatchEvent(new Event('storage'));
    // Also dispatch custom event
    window.dispatchEvent(new CustomEvent('storeSettingsUpdated'));
    console.log('Configurações resetadas para o padrão');
    return { success: true };
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    return { error };
  }
}; 