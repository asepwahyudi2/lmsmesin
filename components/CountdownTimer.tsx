"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadline: string | Date;
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(deadline).getTime() - Date.now();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;

  if (timeLeft.isOver) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
        <Clock size={10} /> Waktu Habis
      </span>
    );
  }

  const { days, hours, minutes } = timeLeft;
  
  // Tentukan warna berdasarkan urgensi
  let colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (days === 0) {
    if (hours < 3) {
      colorClass = "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse";
    } else {
      colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  }

  let text = "";
  if (days > 0) text = `${days}h ${hours}j lagi`;
  else if (hours > 0) text = `${hours}j ${minutes}m lagi`;
  else text = `${minutes}m lagi`;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colorClass}`}>
      <Clock size={11} /> {text}
    </span>
  );
}
