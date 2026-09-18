import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  PlusCircle,
  Heart,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Store,
  Menu,
  X,
  MapPin,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    openPublishModal,
    openAuthModal,
    logout,
    switchUserAccount,
    allUsers,
    filters,
    setSearchQuery,
    resetFilters,
  } = useApp();

  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setActiveView('search');
    setIsMobileMenuOpen(false);
  };

  const favoriteCount = currentUser?.favorites?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top micro-bar with location & safety guarantee */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-400 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Mercado Local: Hato Mayor del Rey • El Valle • Sabana de la Mar</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-400">
              🔒 Encuentros seguros en lugares públicos recomendados
            </span>

            {/* Quick account switch for review/testing */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 rounded px-2 py-0.5 text-xs">
              <span className="text-slate-400">Cuenta:</span>
              <select
                aria-label="Seleccionar cuenta de usuario para pruebas"
                value={currentUser?.id || ''}
                onChange={(e) => switchUserAccount(e.target.value)}
                className="bg-transparent text-emerald-300 font-medium outline-none cursor-pointer text-xs"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name.split(' ')[0]} ({u.role === 'admin' ? '👑 Admin' : 'Vendedor'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <button
            onClick={() => {
              resetFilters();
              setActiveView('home');
            }}
            className="flex items-center gap-2.5 text-left shrink-0 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform">
              HM
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg tracking-tight text-white leading-tight">
                  Vende Todo
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Hato Mayor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block leading-none">
                Marketplace Oficial RD
              </p>
            </div>
          </button>

          {/* Search bar in header (desktop/tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl items-center relative"
          >
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar en Hato Mayor: 'motor CG', 'iPhone', 'nevera', 'terreno'..."
              className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-full pl-11 pr-24 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-full transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Favorites button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  openAuthModal('login');
                } else {
                  setActiveView('favorites');
                }
              }}
              title="Mis Favoritos"
              className={`relative p-2 rounded-xl border transition-colors ${
                activeView === 'favorites'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Heart className="w-5 h-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Admin Panel Quick Access (if admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveView('admin-panel')}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  activeView === 'admin-panel'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}

            {/* "+ Publicar Artículo" prominent CTA */}
            <button
              onClick={openPublishModal}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-sm px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Publicar</span>
              <span className="inline xs:hidden">+</span>
            </button>

            {/* User Profile Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[110px] truncate text-slate-200">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-slate-700">
                      <p className="font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {currentUser.role === 'admin' ? 'Administrador' : 'Vendedor Verificado'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveView('user-dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-700 flex items-center gap-2 text-slate-200"
                    >
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Mi Panel de Vendedor</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('favorites');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-700 flex items-center gap-2 text-slate-200"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Mis Favoritos ({favoriteCount})</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveView('admin-panel');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-700 flex items-center gap-2 text-amber-300 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Panel Administrativo</span>
                      </button>
                    )}

                    <div className="border-t border-slate-700 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar / Registro</span>
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar and quick drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar motor, celular, nevera..."
              className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-20 py-2.5 border border-slate-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
            >
              Buscar
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <button
              onClick={() => {
                setActiveView('home');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-800 text-center font-medium text-slate-200"
            >
              Inicio
            </button>
            <button
              onClick={() => {
                setActiveView('search');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-800 text-center font-medium text-slate-200"
            >
              Explorar Todo
            </button>
            <button
              onClick={() => {
                if (currentUser) {
                  setActiveView('user-dashboard');
                } else {
                  openAuthModal('login');
                }
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-800 text-center font-medium text-slate-200"
            >
              Mis Publicaciones
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveView('admin-panel');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-center"
              >
                Panel Admin
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
