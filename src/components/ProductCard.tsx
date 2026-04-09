"use client";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product, bcvRate }: { product: any, bcvRate: number }) {
  const addItem = useCartStore(state => state.addItem);
  const priceVes = product.price_usd * bcvRate;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-black border border-[#333] rounded-2xl overflow-hidden hover:border-yellow-400/40 transition-all duration-300 flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(250,204,21,0.15)]">
      {/* Glossy highlight effect on top border */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="relative aspect-square w-full overflow-hidden bg-[#0a0a0a] p-6 flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 font-medium tracking-widest text-sm uppercase font-serif">Robelin II</div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500/10 border border-red-500/20 text-red-500 font-medium px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/40">
        <div className="mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/80 font-bold">{product.category}</span>
        </div>
        <h3 className="text-lg font-medium text-white/90 mb-2 leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow font-light">{product.description}</p>
        )}
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xl font-medium text-white shadow-sm">${product.price_usd.toFixed(2)}</p>
            <p className="text-xs font-medium text-gray-600 mt-1">Bs. {priceVes.toFixed(2)}</p>
          </div>
          
          <button 
            onClick={() => addItem(product)}
            disabled={isOutOfStock}
            className="w-10 h-10 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 flex items-center justify-center hover:bg-yellow-400/20 hover:border-yellow-400/60 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] backdrop-blur-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
