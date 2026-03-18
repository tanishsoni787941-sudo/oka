import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center space-x-2 text-sm font-medium bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/5">
      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      <span className="text-stone-700 dark:text-stone-300">Unlocks in:</span>
      <span className="font-mono text-purple-700 dark:text-purple-300">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  );
}
