import React, { useState, useEffect } from 'react';
import { ImageModal } from './ImageModal';

interface ProductGalleryProps {
  images: string[];
  mainImageUrl?: string;
  name: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images = [], mainImageUrl, name }) => {
  // Garantir que todas as imagens estejam em um único array sem duplicatas
  let allImages: string[] = [];
  
  // Se tiver uma imagem principal, adicioná-la primeiro
  if (mainImageUrl && mainImageUrl.trim() !== '') {
    allImages.push(mainImageUrl);
  }
  
  // Adicionar as outras imagens, evitando duplicatas
  if (Array.isArray(images)) {
    images.forEach(img => {
      if (img && img.trim() !== '' && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }
  
  // Se não houver imagens válidas, usar array vazio
  if (allImages.length === 0) {
    console.warn('Nenhuma imagem válida encontrada para o produto:', name);
  }
  
  // Estado para armazenar a imagem principal que está sendo exibida
  const [selectedImage, setSelectedImage] = useState<string>(allImages.length > 0 ? allImages[0] : '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Atualizar a imagem selecionada quando as props mudarem
  useEffect(() => {
    if (allImages.length > 0 && (!selectedImage || !allImages.includes(selectedImage))) {
      console.log('Atualizando imagem selecionada para:', allImages[0]);
      setSelectedImage(allImages[0]);
    }
  }, [allImages, selectedImage]);
  
  // Se não houver imagens, mostrar mensagem
  if (allImages.length === 0) {
    return <div className="text-center p-4">Nenhuma imagem disponível para este produto.</div>;
  }

  return (
    <div className="product-gallery">
      {/* Imagem principal */}
      <div className="main-image-container mb-4">
        <img
          src={selectedImage}
          alt={`Imagem principal de ${name}`}
          className="w-full h-auto object-cover rounded-lg shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
          style={{ maxHeight: '500px' }}
          onClick={() => setIsModalOpen(true)}
          onError={() => {
            console.error('Erro ao carregar imagem principal:', selectedImage);
            // Se houver erro, tentar próxima imagem
            const currentIndex = allImages.indexOf(selectedImage);
            if (currentIndex < allImages.length - 1) {
              setSelectedImage(allImages[currentIndex + 1]);
            }
          }}
        />
      </div>

      {/* Miniaturas */}
      {allImages.length > 1 && (
        <div className="thumbnails-container flex flex-wrap gap-2">
          {allImages.map((image, index) => (
            <div 
              key={index} 
              className={`thumbnail cursor-pointer border-2 rounded-md overflow-hidden ${
                image === selectedImage ? 'border-blue-500' : 'border-gray-200'
              }`}
              onClick={() => {
                console.log('Clicou na miniatura:', image);
                setSelectedImage(image);
              }}
            >
              <img
                src={image}
                alt={`${name} - imagem ${index + 1}`}
                className="w-16 h-16 object-cover"
                onError={(e) => {
                  console.error(`Erro ao carregar thumbnail ${index}:`, image);
                  e.currentTarget.src = 'https://via.placeholder.com/50?text=Erro';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal de Imagem */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={selectedImage}
        alt={`Imagem ampliada de ${name}`}
      />
    </div>
  );
};