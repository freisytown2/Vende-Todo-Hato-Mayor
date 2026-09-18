import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  PlusCircle,
  MapPin,
  Sparkles,
  Bike,
  Smartphone,
  Car,
  Refrigerator,
  Laptop,
  Armchair,
  Home,
  Shirt,
  Building2,
  Sprout,
  Wrench,
  Trophy,
  Baby,
  Dog,
  Briefcase,
  UserCheck,
  Package,
} from 'lucide-react';
import { MUNICIPALITIES } from '../data/initialData';

// Map icon strings to Lucide components
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Bike,
  Smartphone,
  Car,
  Refrigerator,
  Laptop,
  Armchair,
  Home,
  Shirt,
  Building2,
  Sprout,
  Wrench,
  Trophy,
  Baby,
  Dog,
  Briefcase,
  UserCheck,
  Package,
};

export const HeroSearch: React.FC = () => {
  const {
    categories,
    filters,
    setFilters,
    setSearchQuery,
    setCategoryFilter,
    openPublishModal,
    setActiveView,
  } = useApp();

  const [localQuery, setLocalQuery] = useState(filters.searchQuery);
  const [selectedMuni, setSelectedMuni] = useState(filters.municipality || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      searchQuery: localQuery,
      municipality: selectedMuni,
    }));
    setActiveView('search');
  };

  const handleQuickKeyword = (kw: string) => {
    setLocalQuery(kw);
    setSearchQuery(kw);
    setActiveView('search');
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Main Heading */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>El Marketplace Oficial de Hato Mayor</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3 uppercase">
          VENDE TODO EN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">HATO MAYOR</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal">
          “Compra y vende artículos cerca de ti.” Encuentra motores, celulares, electrodomésticos, muebles, terrenos y más en tu propia comunidad.
        </p>

        {/* Search Bar & Municipality Filter Box */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-2.5 rounded-2xl shadow-xl shadow-slate-950/40 border border-slate-200 text-slate-800 flex flex-col md:flex-row gap-2.5 max-w-4xl mx-auto"
        >
          {/* Main Keyword Input */}
          <div className="flex-1 flex items-center relative pl-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="¿Qué estás buscando? Ej: iPhone, motor CG, nevera, cama, solar..."
              className="w-full text-sm sm:text-base text-slate-900 placeholder-slate-400 py-2.5 focus:outline-none bg-transparent"
            />
          </div>

          {/* Municipality Selector */}
          <div className="flex items-center border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3 min-w-[200px]">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mr-1.5" />
            <select
              aria-label="Seleccionar municipio de Hato Mayor"
              value={selectedMuni}
              onChange={(e) => setSelectedMuni(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 font-medium focus:outline-none cursor-pointer py-2"
            >
              <option value="">Toda la provincia</option>
              {MUNICIPALITIES.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base rounded-xl transition-colors shrink-0 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </button>
        </form>

        {/* Quick Search Tag Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Búsquedas populares:</span>
          {['Motor CG', 'iPhone', 'Nevera', 'Cama', 'Televisor', 'Terreno', 'Herramientas'].map(
            (term) => (
              <button
                key={term}
                onClick={() => handleQuickKeyword(term)}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-600/30 hover:text-emerald-300 border border-slate-700/80 transition-colors text-slate-300"
              >
                {term}
              </button>
            )
          )}
        </div>

        {/* CTA Banner: "Publicar artículo" button prominent */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={openPublishModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-xl shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Publicar artículo gratis</span>
          </button>
          <span className="text-xs text-slate-400">
            Sin comisiones • Contacto directo por WhatsApp • Sin revelar tu dirección
          </span>
        </div>
      </div>

      {/* Horizontal Category Grid / Slider */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Explorar por Categoría</span>
            <span className="text-xs font-normal text-slate-400">({categories.length} categorías)</span>
          </h2>
          <button
            onClick={() => {
              setFilters((prev) => ({ ...prev, categoryId: '' }));
              setActiveView('search');
            }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Ver todos los productos →
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Package;
            const isSelected = filters.categoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all group ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200 hover:border-emerald-500/40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-700/60 text-emerald-400'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium line-clamp-1 leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
