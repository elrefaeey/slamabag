import React from 'react';
import { useDiscountCodes } from '@/hooks/useDiscountCodes';

// Checkout-only banner. Clicking "discount code" focuses the discount input.
export const DiscountBanner: React.FC = () => {
  const { discountCodes } = useDiscountCodes();
  const active = discountCodes.find(dc => dc.isActive);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Focus the discount input on this page using its ID; no copy/paste
    const el = document.getElementById('discount-code-input') as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!active) return null; // Hide banner if no active code

  return (
    <div className="mt-4 sm:mt-6" dir="rtl">
      <div className="rounded-xl bg-blue-50 border border-blue-200 shadow-soft px-4 py-3 sm:px-6 sm:py-4">
        <p className="text-sm sm:text-base md:text-lg leading-7 text-right text-foreground">
          عند استخدام كود الخصم
          <button
            onClick={handleClick}
            className="mx-2 inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-extrabold hover:bg-blue-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            {active.code}
          </button>
          ستحصل على
          <span className="mx-1 text-blue-700 font-extrabold text-lg sm:text-xl">
            {active.discountPercentage}%
          </span>
          <span className="font-semibold">خصم</span>
        </p>
      </div>
    </div>
  );
};