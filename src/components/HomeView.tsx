import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroSearch } from './HeroSearch';
import { ListingCard } from './ListingCard';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  MapPin,
  ChevronRight,
  TrendingUp,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { listings, categories, setActiveView, setFilters, openPublishModal } = useApp();

  // Featured items
  const featuredListings = listings.filter(
    (l) => l.isFeatured && l.status === 'Disponible' && l.isApproved
  );

  // Recent items (excluding featured from this block for variety, or showing all latest)
  const recentListings = listings
    .filter((l) => l.status === 'Disponible' && l.isApproved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCategoryClick = (catId: string) => {
    setFilters((prev) => ({ ...prev, categoryId: catId, searchQuery: '' }));
    setActiveView('search');
  };

  return (
    <div>
      {/* Hero Section with Search and Categories */}
      <HeroSearch />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Listings Section */}
        {featuredListings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Publicaciones Destacadas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Artículos recomendados en Hato Mayor del Rey, El Valle y Sabana de la Mar
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, searchQuery: '', categoryId: '' }));
                  setActiveView('search');
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredListings.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid Quick Jump */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Explorar por Categoría</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Hato Mayor Marketplace</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((c) => {
              const count = listings.filter(
                (l) => l.categoryId === c.id && l.status === 'Disponible' && l.isApproved
              ).length;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCategoryClick(c.id)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 text-left transition-all group flex flex-col justify-between"
                >
                  <span className="font-bold text-slate-800 group-hover:text-emerald-800 text-xs line-clamp-1">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 mt-2">
                    {count} {count === 1 ? 'artículo' : 'artículos'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Latest Publications Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Recién Publicados en Hato Mayor
                </h2>
                <p className="text-xs text-slate-500">
                  Oportunidades actualizadas por vecinos y comerciantes locales
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, searchQuery: '', categoryId: '' }));
                setActiveView('search');
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>Explorar todos ({recentListings.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {recentListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentListings.slice(0, 8).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                ¡Sé el primero en vender algo en Hato Mayor!
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Aún no hay publicaciones activas. Sube tus fotos, pon tu precio y número de contacto. Los compradores locales te llamarán o escribirán por WhatsApp.
              </p>
              <button
                onClick={openPublishModal}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Publicar mi primer artículo ahora</span>
              </button>
            </div>
          )}
        </section>

        {/* Local Safety & Community Guarantee Banner */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Consejos de Seguridad para Hato Mayor</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Comercio seguro, transparente y directo entre vecinos
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Recomendamos acordar entregas en lugares públicos concurridos (Parque Central Mercedes de la Rocha, plazas o comercios locales). <strong>Nunca envíes depósitos por adelantado</strong> sin haber verificado físicamente el producto y sus condiciones.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <button
                onClick={openPublishModal}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Artículo Gratis</span>
              </button>
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, searchQuery: '', categoryId: '' }));
                  setActiveView('search');
                }}
                className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all text-center"
              >
                Buscar en Hato Mayor
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
