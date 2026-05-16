import React, { useState, useEffect } from 'react';
// Importar ícones do react-icons
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaGlobe
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';
import { getStoreSettings, resetStoreSettings } from '@/lib/localStorage';
import phpserver from '@/lib/phpserver';
// Interface para as configurações da loja
interface SocialMedia {
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
}

interface StoreSettings {
  footerText: string;
  socialMedia: SocialMedia;
}

const Footer = () => {
  const [footerText, setFooterText] = useState('');
  const [socialMedia, setSocialMedia] = useState<SocialMedia | null>(null);

  useEffect(() => {
    // Função para carregar as configurações
    const loadSettings = () => {
      try {
        const carregarSettings = async () => {
          const dados = await phpserver().getStoreSettings();
          localStorage.setItem('storeSettings', JSON.stringify(dados));
          const settings = dados;
          console.log("Configurações carregadas:", settings.socialMedia);
          setFooterText(settings.footerText || '');
          console.log("Configurações carregadas:", settings.footerText);
          setSocialMedia(settings.socialMedia || null);
          // Se as redes sociais ainda estiverem nulas, forçar o uso dos valores padrão
          if (!settings.socialMedia || settings.socialMedia.enabled === undefined) {
            console.log("Forçando configurações padrão de redes sociais");
            resetStoreSettings();
          }
        };
        carregarSettings();
      } catch (error) {
        console.error('Erro ao carregar configurações do rodapé:', error);
      }
    };

    // Carregar ao montar o componente
    loadSettings();

    // Escutar por alterações no localStorage
    const handleStorageChange = () => {
      loadSettings();
    };

    // Adicionar evento de armazenamento e evento personalizado
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storeSettingsUpdated', handleStorageChange);

    // Remover eventos ao desmontar
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storeSettingsUpdated', handleStorageChange);
    };
  }, []);

  // Tamanho dos ícones
  const iconSize = 32;

  // Renderizar ícones de redes sociais
  const renderSocialIcons = () => {
    if (!socialMedia) {
      console.log("Social media não definido");
      return null;
    }

    if (!socialMedia.enabled) {
      console.log("Social media desabilitado");
      return null;
    }

    console.log("Renderizando ícones", socialMedia);

    return (
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-4">
        {socialMedia.instagram?.enabled && (
          <a
            href={socialMedia.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors bg-white p-2 rounded-full"
            title="Instagram"
          >
            <FaInstagram size={iconSize} />
          </a>
        )}

        {socialMedia.facebook?.enabled && (
          <a
            href={socialMedia.facebook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors bg-white p-2 rounded-full"
            title="Facebook"
          >
            <FaFacebookF size={iconSize} />
          </a>
        )}

        {socialMedia.twitter?.enabled && (
          <a
            href={socialMedia.twitter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition-colors bg-white p-2 rounded-full"
            title="Twitter/X"
          >
            <FaXTwitter size={iconSize} />
          </a>
        )}

        {socialMedia.tiktok?.enabled && (
          <a
            href={socialMedia.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition-colors bg-white p-2 rounded-full"
            title="TikTok"
          >
            <SiTiktok size={iconSize} />
          </a>
        )}

        {socialMedia.whatsapp?.enabled && (
          <a
            href={socialMedia.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-green-500 transition-colors bg-white p-2 rounded-full"
            title="WhatsApp"
          >
            <FaWhatsapp size={iconSize} />
          </a>
        )}

        {socialMedia.website?.enabled && (
          <a
            href={socialMedia.website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-teal-500 transition-colors bg-white p-2 rounded-full"
            title="Website"
          >
            <FaGlobe size={iconSize} />
          </a>
        )}
      </div>
    );
  };

  return (
    <footer className="bg-gray-100 py-8">
      <div className="container px-4 mx-auto">
        <div className="text-center text-sm text-gray-500">
          <div className="mb-6">
            <h4 className="text-base font-semibold mb-3">Siga-nos nas redes sociais</h4>
            {renderSocialIcons()}
          </div>
          <div className="w-full flex flex-col items-center gap-1 mt-4">
            <a href="/politica-de-privacidade" className="text-xs text-gray-500 hover:underline mb-1">Política de Privacidade</a>
            <span className="text-xs text-gray-500">{footerText}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
