import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Globe, ShoppingCart, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet';
import phpserver from '@/lib/phpserver';
import { saveCart } from '../lib/supabase';
interface GarimpoCard {
  id: string;
  imageUrl: string;
  storeName: string;
  productName: string;
  price: string;
  phone: string;
  whatsappLink: string;
  instagramUrl: string;
}

const GarimpoOfertaViewImg = () => {
  const [card, setCard] = useState<GarimpoCard | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    async function sincronizarCard() {
      const cardId = window.location.pathname.split('/').pop();
      if (cardId) {
        const saveCards = await phpserver().getIframe();
        localStorage.setItem('garimpo_cards', JSON.stringify(saveCards));
        const savedCards = saveCards;
        const foundCard = savedCards.id === cardId ? savedCards : null;
        if (foundCard) {
          setCard(foundCard);
          setCarregando(false);
        }
      }
    }

    sincronizarCard();
  }, []);

  // if (!card) {
  //   return <div>Card não encontrado</div>;
  // }

  const handleWhatsAppClick = () => {
    const message = `Olá, gostaria de comprar ${card.productName}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${card.phone.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
  };
  if (carregando) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white text-gray-700">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold">Aguarde um momento...</p>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title>{card.productName} - Garimpo de Ofertas</title>
        <meta property="og:title" content="CONFIRA EM NOSSO SITE" />
        <meta property="og:description" content={card.productName} />
        <meta property="og:image" content={card.imageUrl} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CONFIRA EM NOSSO SITE" />
        <meta name="twitter:description" content={card.productName} />
        <meta name="twitter:image" content={card.imageUrl} />
      </Helmet>
      <div className="w-full bg-white">
        <Card className="w-full border-0 shadow-none">
          <CardContent className="p-0 ">
            <div className="relative w-full" style={{ paddingTop: '100%' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={card.imageUrl}
                  alt={card.productName}
                  className="w-full h-full object-cover"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GarimpoOfertaViewImg; 