import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

/**
 * Componente de Logo HabitFlow.
 * Renderiza la imagen junto con el nombre de la marca en tipografía de alto impacto
 * y el eslogan oficial de la empresa, con espaciado mínimo para máxima cohesión.
 */
export const Logo: React.FC<LogoProps> = ({ className = "w-40 h-40", showText = true }) => {
  // Enlace directo al logo en Google Drive proporcionado recientemente
  const logoUrl = "https://lh3.googleusercontent.com/d/1OomTCiQav_gm35pJvKY1IqiA1qmlzpdf";

  return (
    <div className="flex flex-col items-center justify-center select-none group">
      <div className={`${className} relative flex items-center justify-center transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-2`}>
        <img 
          src={logoUrl} 
          alt="HabitFlow Logo" 
          className="w-full h-full object-contain transition-transform duration-700 drop-shadow-[0_10px_30px_rgba(211,255,153,0.3)]"
          loading="eager"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('habitflow_logo.png')) {
              target.src = "https://raw.githubusercontent.com/ai-gen-images/logos/main/habitflow_logo.png";
            }
          }}
        />
      </div>
      
      {showText && (
        <div className="mt-1 text-center animate-in fade-in slide-in-from-top-6 duration-1000">
          <h1 className="text-6xl md:text-7xl font-brand font-black text-white uppercase tracking-tight leading-none group-hover:text-brand-lime transition-colors">
            HabitFlow
          </h1>
          <p className="text-[12px] md:text-[14px] text-brand-lime font-sans font-bold uppercase tracking-[0.5em] mt-2 opacity-90">
            Pequeños pasos, grandes cambios
          </p>
        </div>
      )}
    </div>
  );
};