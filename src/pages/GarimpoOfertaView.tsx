import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Globe, ShoppingCart, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Helmet } from 'react-helmet';
import phpserver from '@/lib/phpserver';
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

const GarimpoOfertaView = () => {
  const [card, setCard] = useState<GarimpoCard | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    async function sincronizarCard() {
      const cardId = window.location.pathname.split('/').pop();
      if (cardId) {
        try {
          const saveCards = await phpserver().getIframe();
          localStorage.setItem('garimpo_cards', JSON.stringify(saveCards));
          const savedCards = saveCards;
          const foundCard = savedCards.id === cardId ? savedCards : null;
          if (foundCard) {
            setCard(foundCard);
          }
        } catch (error) {
          console.error('Erro ao carregar card:', error);
        }
      }
      setCarregando(false);
    }

    sincronizarCard();
  }, []);

  // if (!card) {
  //   return <div>Card não encontrado</div>;
  // }

  const handleWhatsAppClick = () => {
    if (!card) return;
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
  if (!card) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white text-gray-700">
        <p className="text-lg font-semibold">Card não encontrado</p>
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

                {/* Botão do carrinho */}
                <button
                  onClick={handleWhatsAppClick}
                  className="absolute top-2 left-2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 shadow-lg transition-transform hover:scale-110 z-10"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>

                {/* Ícones sociais e botão de visualização */}
                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-white hover:text-gray-300 bg-black/50 rounded-full p-1.5"
                  >
                    <Eye size={16} />
                  </button>
                  {card.instagramUrl && (
                    <a
                      href={card.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-300 bg-black/50 rounded-full p-1.5"
                    >
                      <Instagram size={16} />
                    </a>
                  )}
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 bg-black/50 rounded-full p-1.5"
                  >
                    <Globe size={16} />
                  </a>
                </div>

                {/* Informações do produto */}
                {showInfo && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold pr-2 line-clamp-2">{card.productName}</h3>
                    </div>

                    <p className="text-sm font-bold mb-1">{card.price}</p>
                    <h4 className="text-[10px] text-gray-200 line-clamp-1 mb-2">{card.storeName}</h4>

                    <Button
                      onClick={handleWhatsAppClick}
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-6 text-[10px]"
                    >
                      <ShoppingCart className="mr-0.5 h-2.5 w-2.5" />
                      <span className="font-semibold">Comprar</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GarimpoOfertaView; 