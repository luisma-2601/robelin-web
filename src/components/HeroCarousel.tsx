"use client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";

export default function HeroCarousel({ products }: { products: Product[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Usar solo los primeros 5 productos con foto para el carrusel
  const carouselProducts = products?.filter(p => p.image_url).slice(0, 5) || [];

  useEffect(() => {
    if (carouselProducts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselProducts.length);
    }, 4000); // 4 seconds
    return () => clearInterval(interval);
  }, [carouselProducts]);

  if (carouselProducts.length === 0) return null;

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-[30px] overflow-hidden mb-20 border border-white/5 shadow-[0_0_50px_rgba(250,204,21,0.1)] group">
      {carouselProducts.map((product, index) => (
        <div
          key={product.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Glass Gradient overlay para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent z-10"></div>
          
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transform scale-105 transition-transform duration-[10000ms] group-hover:scale-110 opacity-70"
          />
          
          <div className="absolute bottom-12 left-6 md:bottom-16 md:left-16 z-20 max-w-2xl px-4 md:px-0">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
              Recomendado
            </span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-4 leading-tight drop-shadow-lg">
              {product.name}
            </h2>
            <p className="text-gray-300 line-clamp-2 md:line-clamp-3 text-base md:text-lg mb-8 max-w-xl font-light">
              {product.description}
            </p>
            
            <a 
              href="#catalogo" 
              className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 font-semibold px-6 py-3 rounded-full hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all backdrop-blur-md"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver Catálogo <ArrowRight size={18} />
            </a>
          </div>
        </div>
      ))}
      
      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {carouselProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex ? "w-8 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Ir a la foto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
