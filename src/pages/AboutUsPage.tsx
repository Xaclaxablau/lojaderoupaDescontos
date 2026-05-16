import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getStoreSettings } from '@/lib/localStorage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AboutUsContent {
  title: string;
  content: string;
  enabled: boolean;
  images: string[];
}

const AboutUsPage = () => {
  const [aboutUs, setAboutUs] = useState<AboutUsContent>({
    title: '',
    content: '',
    enabled: false,
    images: []
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const settings = getStoreSettings();
    if (settings?.aboutUs) {
      setAboutUs(settings.aboutUs);
    }
  }, []);

  const goToNextImage = () => {
    if (aboutUs.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === aboutUs.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const goToPrevImage = () => {
    if (aboutUs.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? aboutUs.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (!aboutUs.enabled) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>Página não disponível</title>
        </Helmet>
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Informação não disponível</h1>
            <p className="text-gray-600">Esta página ainda não está disponível.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filtrar imagens vazias
  const validImages = aboutUs.images.filter(img => img);
  const hasImages = validImages.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{aboutUs.title || 'Quem Somos'}</title>
      </Helmet>
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title section */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {aboutUs.title || 'Quem Somos'}
            </h1>
            <div className="w-24 h-1 bg-gray-800 mx-auto"></div>
          </div>

          {/* About us content */}
          <div className="mb-16 max-w-3xl mx-auto">
            <div className="prose prose-lg max-w-none">
              {aboutUs.content.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index} className="mb-4">{paragraph}</p> : <br key={index} />
              ))}
            </div>
          </div>

          {/* Image carousel at the end */}
          {hasImages && (
            <div className="my-12 max-w-3xl mx-auto">
              <div className="relative">
                <div className="relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg mx-auto">
                  <img 
                    src={validImages[currentImageIndex]} 
                    alt={`Imagem ${currentImageIndex + 1}`} 
                    className="w-[500px] h-[500px] object-cover mx-auto"
                  />
                  
                  {validImages.length > 1 && (
                    <>
                      <button 
                        onClick={goToPrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Imagem anterior"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Próxima imagem"
                      >
                        <ChevronRight size={24} />
                      </button>
                      
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        {validImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                            }`}
                            aria-label={`Ir para imagem ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Call to action section */}
          <div className="bg-gray-50 rounded-lg p-8 my-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Visite Nossa Loja</h2>
            <p className="text-gray-600 mb-6">
              Estamos ansiosos para recebê-lo em nossa loja e oferecer uma experiência personalizada.
            </p>
            <a 
              href="/" 
              className="inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Ver Produtos
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUsPage; 