import React from 'react';

interface GestifyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

const GestifyLogo: React.FC<GestifyLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'dark'
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const colorClasses = {
    light: 'text-white',
    dark: 'text-gray-800 dark:text-white'
  };

  return (
    <div className={`font-bold tracking-tight ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}>
      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Gestify
      </span>
    </div>
  );
};

export default GestifyLogo;
