"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

export default function Catalog({ products, bcvRate, isAdmin }: { products: any[], bcvRate: number, isAdmin?: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchLower) || 
      product.description?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  const isAllOutOfStock = filteredProducts.length > 0 && filteredProducts.every(p => p.stock <= 0);

  return (
    <div className="w-full space-y-8">
      {/* Search and Filter Tabs */}
      <div className="flex flex-col gap-6">
        <div className="relative max-w-3xl mx-auto w-full mt-2">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 text-lg border border-white/10 rounded-full bg-[#111] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-md"
            placeholder="Buscar productos en todo el catálogo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
              selectedCategory === null
                ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                : "bg-[#111] text-gray-400 border-white/5 hover:border-white/20 hover:text-white"
            }`}
          >
            Todos
          </button>
          
          {PRODUCT_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                selectedCategory === category
                  ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                  : "bg-[#111] text-gray-400 border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
          
          {isAdmin && (
            <Link 
              href="/admin/products/new" 
              className="px-5 py-2.5 ml-2 rounded-full text-sm font-bold transition-all duration-300 border bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] flex items-center gap-2 uppercase tracking-wide backdrop-blur-md"
            >
              <Plus size={16} /> Nuevo
            </Link>
          )}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length > 0 ? (
        <>
          {isAllOutOfStock && (
            <div className="w-full text-center py-6 mb-4 bg-primary/5 border border-primary/20 rounded-xl">
              <span className="text-primary font-medium">Próximamente más productos de {selectedCategory || "nuestras colecciones"}.</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} bcvRate={bcvRate} />
            ))}
          </div>
        </>
      ) : (
        <div className="w-full text-center py-32 bg-[#111]/50 border border-white/5 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/5 mb-6 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(250,204,21,0.15)]">
            <span className="font-serif text-white/50 text-2xl">R</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-white/90 mb-3">
            {selectedCategory ? `Próximamente más productos de ${selectedCategory}` : "No existen productos"}
          </h2>
          <p className="text-gray-500 max-w-sm">
            {selectedCategory 
              ? "Estamos reabasteciendo nuestro catálogo. Vuelve pronto para descubrir nuestra nueva línea."
              : "No hemos encontrado productos que coincidan con tu búsqueda. Intenta con otros términos." }
          </p>
        </div>
      )}
    </div>
  );
}
