import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface MetaTagsProps {
  title: string;
  description: string;
  image: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({ title, description, image }) => {
  // Usar uma URL padrão quando nenhuma imagem estiver definida
  const defaultImage = '/opengraph-image.png';
  
  // Verificar se a imagem está em formato base64 (o que não funciona para compartilhamento)
  const isBase64Image = image && image.startsWith('data:');
  
  // Se estiver em localhost e for base64, usamos a imagem padrão
  // Em produção, idealmente a imagem deveria ser hospedada em um servidor
  const imageUrl = (!image || isBase64Image) ? defaultImage : image;
  
  useEffect(() => {
    // Mostrar um aviso no console se estiver em desenvolvimento e usando uma imagem base64
    if (isBase64Image && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.warn('Aviso: Imagens em formato base64 não funcionam para OpenGraph/compartilhamento. Em produção, use uma URL absoluta para a imagem.');
    }
  }, [isBase64Image]);
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={window.location.href} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default MetaTags; 