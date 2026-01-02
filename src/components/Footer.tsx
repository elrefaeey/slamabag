import { Lock } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface FooterProps {
  onAdminClick?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToProducts?: () => void;
}

export const Footer = ({
  onAdminClick,
  onNavigateToHome,
  onNavigateToProducts
}: FooterProps) => {
  const [showPolicy, setShowPolicy] = useState(false);

  // Developer WhatsApp contact message in Arabic
  const developerWhatsapp = '201092940685';
  const developerMessage = 'جئت من موقع MY BAG، هل يمكنني الحصول على مزيد من التفاصيل إذا أردت إنشاء موقع؟';

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/mybagg2025?igsh=MTlvb2E4a3R2aHZhOQ==', '_blank');
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/201068798221', '_blank');
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="bg-white text-gray-800 border-t border-clean-neutral">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Mobile-First Vertical Stack Layout */}
          <div className="flex flex-col items-center text-center space-y-8">

            {/* Brand Section */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-wide">MY BAG</h2>
              <div className="space-y-2 max-w-sm sm:max-w-md">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                  Discover premium handbags and accessories crafted for the modern lifestyle.
                </p>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                  Style meets quality in every piece.
                </p>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Quick Links</h3>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={onNavigateToHome}
                  className="text-gray-600 hover:text-clean-accent transition-colors duration-200 text-sm sm:text-base font-medium"
                >
                  Home
                </button>
                <button
                  onClick={onNavigateToProducts}
                  className="text-gray-600 hover:text-clean-accent transition-colors duration-200 text-sm sm:text-base font-medium"
                >
                  Products
                </button>
              </div>
            </div>

            {/* Social Icons Section */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Follow Us</h3>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleInstagramClick}
                  className="flex items-center justify-center gap-3 text-gray-600 hover:text-clean-accent transition-colors duration-200 text-sm sm:text-base font-medium"
                >
                  <span className="text-xl">📷</span>
                  Instagram
                </button>
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center justify-center gap-3 text-gray-600 hover:text-clean-accent transition-colors duration-200 text-sm sm:text-base font-medium"
                >
                  <span className="text-xl">💬</span>
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Bottom Section with Policy Link and Lock Icon */}
            <div className="border-t border-clean-neutral pt-6 w-full">
              <div className="flex flex-col items-center justify-center gap-3">
                {/* Policy link above the copyright */}
                <button
                  onClick={() => setShowPolicy(true)}
                  className="text-xs sm:text-sm text-clean-accent hover:underline"
                >
                  Order Receipt Policy
                </button>

                <p className="text-xs sm:text-sm text-gray-500 font-light text-center">
                  © 2025 MY BAG. All rights reserved.<br />
                  Developed by{' '}
                  <a
                    href={`https://wa.me/${developerWhatsapp}?text=${encodeURIComponent(developerMessage)}`}
                    style={{ color: '#FFD700', fontWeight: 'bold', textDecoration: 'none' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ahmed erefaey
                  </a>
                </p>
                {onAdminClick && (
                  <button
                    onClick={onAdminClick}
                    className="text-gray-500 hover:text-clean-accent transition-colors duration-200"
                    title="Admin Access"
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Dialog */}
      <Dialog open={showPolicy} onOpenChange={setShowPolicy}>
        <DialogContent>
          <div className="p-5 sm:p-6">
            <DialogTitle className="text-center mb-3">Order Receipt Policy</DialogTitle>
            <p className="text-sm leading-7 text-gray-700" dir="rtl">
              عميلنا العزيز، نود التوضيح أن الشحنة يتم تجهيزها طبقًا لما تم طلبه فقط، ولا يتم إرسال أكثر من قطعة للاختيار بينها. كما أن نظامنا لا يتيح التسليم الجزئي، حيث يتم تسليم الطلب كاملًا مع سداد المبلغ المستحق، أو يتم إرجاع الطلب بالكامل. شاكرين تفهمكم وتقديركم.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};