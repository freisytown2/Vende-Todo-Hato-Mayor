import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ListingCard } from './ListingCard';
import { MUNICIPALITIES } from '../data/initialData';
import {
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  PackageX,
} from 'lucide-react';

export const SearchResults: React.FC = () => {
  const { listings, categories, filters, setFilters, resetFilters, openPublishModal } = useApp();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSoldItems, setShowSoldItems] = useState(false);

  // Available sectors dynamically calculated based on selected municipality
  const activeMunicipalityData = useMemo(() => {
    return MUNICIPALITIES.find((m) => m.name === filters.municipality);
  }, [filters.municipality]);

  // Filtering engine
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Respect approval
      if (!item.isApproved) return false;

      // Sold status filter
      if (!showSoldItems && item.status === 'Vendido') {
        return false;
      }

      // Search keyword query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inSector = item.sector.toLowerCase().includes(q);
        const inMuni = item.municipality.toLowerCase().includes(q);
        const inCategory = categories
          .find((c) => c.id === item.categoryId)
          ?.name.toLowerCase()
          .includes(q);

        if (!inTitle && !inDesc && !inSector && !inMuni && !inCategory) {
          return false;
        }
      }

      // Category
      if (filters.categoryId && item.categoryId !== filters.categoryId) {
        return false;
      }

      // Condition
      if (filters.condition && item.condition !== filters.condition) {
        return false;
      }

      // Municipality
      if (filters.municipality && item.municipality !== filters.municipality) {
        return false;
      }

      // Sector
      if (filters.sector && item.sector !== filters.sector) {
        return false;
      }

      // Meeting place type
      if (filters.meetingPlaceType && item.meetingPlaceType !== filters.meetingPlaceType) {
        return false;
      }

      // Price range
      if (filters.minPrice) {
        const min = parseFloat(filters.minPrice);
        if (!isNaN(min) && item.price < min) return false;
      }
      if (filters.maxPrice) {
        const max = parseFloat(filters.maxPrice);
        if (!isNaN(max) && item.price > max) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      // Default: recent (and featured first)
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, categories, filters, showSoldItems]);

  const activeFiltersCount = [
    filters.searchQuery,
    filters.categoryId,
    filters.condition,
    filters.municipality,
    filters.sector,
    filters.meetingPlaceType,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top action bar: count & sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Explorar Publicaciones</span>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {filteredListings.length} encontrados
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {filters.searchQuery ? (
              <span>
                Resultados para <strong className="text-slate-800">"{filters.searchQuery}"</strong> en Hato Mayor
              </span>
            ) : (
              'Artículos disponibles para entrega inmediata en Hato Mayor y zonas cercanas'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Ordenar:</span>
            <select
              aria-label="Ordenar artículos"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as 'recent' | 'price_asc' | 'price_desc',
                }))
              }
              className="bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
            >
              <option value="recent">Más recientes primero</option>
              <option value="price_asc">Menor precio (RD$)</option>
              <option value="price_desc">Mayor precio (RD$)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar filters + Listing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Sidebar Filters Desktop */}
        <div
          className={`lg:block ${
            showMobileFilters ? 'block fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
          }`}
        >
          {showMobileFilters && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 lg:hidden">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                Filtros de Búsqueda
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-slate-500 font-bold px-3 py-1 bg-slate-100 rounded-lg text-xs"
              >
                Cerrar ✕
              </button>
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Filtrar Artículos
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpiar
                </button>
              )}
            </div>

            {/* Keyword search input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Palabra clave
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder="Ej. iPhone, CG, cama..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Category selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Categoría
              </label>
              <select
                aria-label="Filtrar por categoría"
                value={filters.categoryId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="">Todas las categorías ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipality & Sector */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Municipio
                </label>
                <select
                  aria-label="Filtrar por municipio"
                  value={filters.municipality}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      municipality: e.target.value,
                      sector: '', // reset sector when muni changes
                    }))
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  <option value="">Todos los municipios</option>
                  {MUNICIPALITIES.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sector o Comunidad
                </label>
                <select
                  aria-label="Filtrar por sector o comunidad"
                  value={filters.sector}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sector: e.target.value }))
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  <option value="">Cualquier sector</option>
                  {activeMunicipalityData
                    ? activeMunicipalityData.sectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))
                    : MUNICIPALITIES[0].sectors.map((s) => (
                        <option key={s} value={s}>
                          {s} (Hato Mayor del Rey)
                        </option>
                      ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rango de Precio (RD$)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                  }
                  placeholder="Mínimo"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                  }
                  placeholder="Máximo"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Condición del artículo
              </label>
              <div className="space-y-1.5">
                {['', 'Nuevo', 'Como nuevo', 'Usado'].map((cond) => (
                  <label
                    key={cond || 'all'}
                    className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="conditionFilter"
                      checked={filters.condition === cond}
                      onChange={() => setFilters((prev) => ({ ...prev, condition: cond }))}
                      className="text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span>{cond || 'Cualquier condición'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Meeting Place Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lugar de Entrega / Encuentro
              </label>
              <select
                aria-label="Filtrar por tipo de lugar de encuentro"
                value={filters.meetingPlaceType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, meetingPlaceType: e.target.value }))
                }
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="">Todos los tipos</option>
                <option value="public">🛡️ Lugar público seguro</option>
                <option value="business">🏪 En un negocio local</option>
                <option value="home">🏡 Casa del vendedor</option>
                <option value="other">📍 Otro acordado</option>
              </select>
            </div>

            {/* Toggle show sold */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSoldItems}
                  onChange={(e) => setShowSoldItems(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <span>Incluir artículos vendidos</span>
              </label>
            </div>

            {showMobileFilters && (
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Ver {filteredListings.length} resultados
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid Area */}
        <div className="lg:col-span-3">
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                No se encontraron artículos con estos filtros
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Prueba buscando con palabras más generales o elimina algunos filtros para ver más opciones en Hato Mayor.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Restablecer filtros
                </button>
                <button
                  onClick={openPublishModal}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Sé el primero en publicar esto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
