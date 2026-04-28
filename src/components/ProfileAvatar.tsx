import React from 'react';
import { cn } from '@/src/lib/utils';

interface ProfileAvatarProps {
  username: string;
  seed: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const colors = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 
  'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 
  'bg-amber-500', 'bg-orange-500', 'bg-red-500'
];

export default function ProfileAvatar({ username, seed, size = 'md', className }: ProfileAvatarProps) {
  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  
  // Deterministic color based on seed or username
  const colorIndex = (seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const bgColor = colors[colorIndex];

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-4xl'
  };

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-bold text-white shadow-lg border border-white/10 shrink-0",
      bgColor,
      sizeClasses[size],
      className
    )}>
      {getInitial(username)}
    </div>
  );
}
