import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = "",
  variant = 'rectangular' 
}) => {
  const baseClasses = "animate-pulse bg-slate-800";
  
  let variantClasses = "";
  if (variant === 'circular') {
    variantClasses = "rounded-full";
  } else if (variant === 'text') {
    variantClasses = "rounded h-4 w-full";
  } else {
    variantClasses = "rounded-xl";
  }

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} />
  );
};
