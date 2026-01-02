import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'prominent' | 'banner';
}

export const CountdownTimer = ({
  endTime,
  onExpire,
  className = "",
  size = 'small',
  variant = 'default'
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        setIsExpired(true);
        onExpire?.();
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (isExpired) {
    return null;
  }

  // Banner variant - full width red banner like in the image
  if (variant === 'banner') {
    return (
      <div className={`w-full bg-red-600 text-white py-3 px-4 rounded-lg shadow-lg ${className}`}>
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Offer ends in</div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold font-mono">
            <span>{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-xs font-normal">D</span>
            <span className="mx-1">:</span>
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs font-normal">H</span>
            <span className="mx-1">:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs font-normal">M</span>
            <span className="mx-1">:</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs font-normal">S</span>
          </div>
        </div>
      </div>
    );
  }

  // Define size and variant styles for other variants
  const sizeStyles = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-lg md:text-xl'
  };

  const variantStyles = {
    default: 'text-destructive',
    prominent: 'text-white bg-red-600 px-3 py-2 rounded-lg font-bold shadow-lg',
    banner: '' // handled above
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  const baseClasses = `flex items-center gap-1 font-medium ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <div className={baseClasses}>
      <Clock className={iconSizes[size]} />
      <span className="font-mono">
        {timeLeft.days > 0 && `${String(timeLeft.days).padStart(2, '0')}:`}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};