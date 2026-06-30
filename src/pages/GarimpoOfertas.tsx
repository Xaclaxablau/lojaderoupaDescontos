import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Upload, Edit2, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

const GarimpoOfertas = () => {
  const [image, setImage] = useState<string>('');
  const [storeName, setStoreName] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [card, setCard] = useState<GarimpoCard | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [servidor, setServidor] = useState('');
  useEffect(() => {
    // Carregar card existente do localStorage
    async function syncIframe() {
      try {
        const savedCard = await phpserver().getIframe();
        console.log(typeof savedCard);
        if (typeof savedCard === 'object' && savedCard.id !== undefined && savedCard.id !== null && savedCard.id !== '' && savedCard.id !== 'null' && savedCard.id !== 'undefined') {
          console.log(savedCard);
          const parsedCard = savedCard;
          localStorage.setItem('garimpo_card', JSON.stringify(parsedCard));
          setCard(parsedCard);
          // Preencher os campos com os dados existentes

          setImage(parsedCard.imageUrl);
          setStoreName(parsedCard.storeName);
          setProductName(parsedCard.productName);
          setPrice(parsedCard.price);
          setPhone(parsedCard.phone);
          setInstagramUrl(parsedCard.instagramUrl || '');
          setCarregando(false);
          setServidor(phpserver().servidor);
        } else {
          setCard(null);
          setImage('');
          setStoreName('');
          setProductName('');
          setPrice('');
          setPhone('');
          setInstagramUrl('');
          setIsEditing(false);
          setCarregando(false);
          setServidor(phpserver().servidor);
        }
      } catch (error) {
        console.error('Erro ao carregar iframe:', error);
        setCarregando(false);
        setServidor(phpserver().servidor);
      }
    }

    syncIframe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) { // 6MB em bytes
        toast.error('A imagem deve ter no máximo 6MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String); // aqui você armazena a imagem em base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image || !storeName || !productName || !price || !phone) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const whatsappLink = `https://wa.me/${phone.replace(/\D/g, '')}`;

    const newCard: GarimpoCard = {
      id: card?.id || Date.now().toString(),
      imageUrl: image,
      storeName,
      productName,
      price,
      phone,
      whatsappLink,
      instagramUrl
    };
    await phpserver().updateIframe(newCard);
    localStorage.setItem('garimpo_card', JSON.stringify(newCard));
    setCard(newCard);
    setIsEditing(false);
    toast.success(isEditing ? 'Card atualizado com sucesso!' : 'Card criado com sucesso!');
  };

  const handleDelete = async () => {
    await phpserver().deleteIframe();
    localStorage.removeItem('garimpo_card');
    setCard(null);
    setImage('');
    setStoreName('');
    setProductName('');
    setPrice('');
    setPhone('');
    setInstagramUrl('');
    setIsEditing(false);
    toast.success('Card excluído com sucesso!');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!user) {
    return <div>Acesso negado</div>;
  }
  if (carregando) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white text-gray-700">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold">Aguarde um momento...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Garimpo de Ofertas</CardTitle>
        </CardHeader>
        <CardContent>
          {(!card || isEditing) ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Imagem do Produto*</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!isEditing}
                />
                <p className="text-sm text-gray-500">
                  Tamanho máximo: 6MB. Formatos aceitos: JPG, PNG, GIF
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName">Nome do Produto*</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => {
                    if (e.target.value.length <= 40) {
                      setProductName(e.target.value);
                    }
                  }}
                  placeholder="Nome do produto em promoção"
                  maxLength={40}
                  required
                />
                <p className="text-sm text-gray-500">
                  {productName.length}/40 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da Loja*</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => {
                    if (e.target.value.length <= 40) {
                      setStoreName(e.target.value);
                    }
                  }}
                  placeholder="Nome da sua loja"
                  maxLength={40}
                  required
                />
                <p className="text-sm text-gray-500">
                  {storeName.length}/40 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço*</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="R$ 0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (WhatsApp)*</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">URL do Instagram</Label>
                <Input
                  id="instagram"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/sua-loja"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="mr-2 h-4 w-4" />
                  {isEditing ? 'Atualizar Card' : 'Publicar Card'}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square w-full max-w-md mx-auto">
                <img
                  src={card.imageUrl}
                  alt={card.storeName}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{card.storeName}</h3>
                <p className="text-xl font-bold text-shop-red">{card.price}</p>
                <a
                  href={card.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  {card.phone}
                </a>
              </div>

              <div className="space-y-2">
                <Label>Visualização do Card</Label>
                <div className="border rounded-lg overflow-hidden" style={{ height: 'auto' }}>
                  <iframe
                    src={`${window.location.origin}/garimpo/${card.id}`}
                    className="w-full"
                    style={{ width: '100%', aspectRatio: '1/1', height: '100%', margin: '0 auto' }}
                    title="Visualização do Card"
                    scrolling="no"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Use este iframe para incorporar o card em outros sites. Copie o código abaixo:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={`<iframe src="${window.location.origin}/garimpo/${card.id}" style="width: 100%; aspect-ratio: 1/1; height: 100%; margin: 0 auto;" frameborder="0" scrolling="no" title="Card do Garimpo de Ofertas"></iframe>`}
                    readOnly
                  />
                  <Input
                    value={`${servidor}/img.jpg`}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="${window.location.origin}/garimpo/${card.id}" width="1080" height="1080" frameborder="0" scrolling="no" title="Card do Garimpo de Ofertas"></iframe>`);
                      toast.success('Código do iframe copiado!');
                    }}
                  >
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${servidor}/img.jpg`);
                      toast.success('Código do iframe copiado!');
                    }}
                  >
                    Copiar Imagem
                  </Button>
                </div>
                <div className="mt-2">
                  <a
                    href={`${window.location.origin}/garimpo/${card.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Globe size={14} />
                    Ver card em página separada
                  </a>
                </div>
              </div>

              <div className="flex gap-2 mt-8">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEdit}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar Card
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Card
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GarimpoOfertas; 