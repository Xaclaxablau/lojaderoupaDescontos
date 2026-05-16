import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, alt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}; 