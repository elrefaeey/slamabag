import { MessageCircle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FloatingSocialIcons = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/201068798221', '_blank');
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/mybagg2025?igsh=MTlvb2E4a3R2aHZhOQ==', '_blank');
  };

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-3">
      <Button
        onClick={handleWhatsAppClick}
        className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-medium hover:scale-110 transition-all duration-300"
        title="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Button
        onClick={handleInstagramClick}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-medium hover:scale-110 transition-all duration-300"
        title="Follow us on Instagram"
      >
        <Instagram className="h-6 w-6" />
      </Button>
    </div>
  );
};