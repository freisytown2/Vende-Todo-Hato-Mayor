import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ItemStatus } from '../types';
import { ListingCard } from './ListingCard';
import { formatRDPrice, formatRelativeTime, formatPhoneNumber } from '../utils/imageCompressor';
import { MUNICIPALITIES } from '../data/initialData';
import {
  Package,
  PlusCircle,
  Heart,
  User as UserIcon,
  MessageSquare,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Settings,
  Eye,
  CheckCheck,
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    listings,
    buyerContacts,
    openPublishModal,
    openEditListing,
    deleteListing,
    changeListingStatus,
    openListingDetail,
    setActiveView,
    allUsers,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my-listings' | 'favorites' | 'contacts' | 'profile'>('my-listings');
  const [listingFilter, setListingFilter] = useState<'all' | 'available' | 'sold'>('all');

  // Edit profile state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileSector, setProfileSector] = useState(currentUser?.sector || 'Las Malvinas');
  const [profileMuni, setProfileMuni] = useState(currentUser?.municipality || 'Hato Mayor del Rey');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <h2 className="text-xl font-bold text-slate-800">Inicia sesión</h2>
        <p className="text-sm text-slate-500 mt-2">
          Debes iniciar sesión para acceder a tu panel de usuario y vendedor.
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="mt-6 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
        >
          Ir al inicio
        </button>
      </div>
    );
  }

  // User's own listings
  const myListings = listings.filter((l) => l.sellerId === currentUser.id);
  const displayedListings = myListings.filter((l) => {
    if (listingFilter === 'available') return l.status !== 'Vendido';
    if (listingFilter === 'sold') return l.status === 'Vendido';
    return true;
  });

  // User's favorites
  const favoriteListings = listings.filter((l) => currentUser.favorites?.includes(l.id));

  // Contacts received for this seller
  const myInquiries = buyerContacts.filter((c) => c.sellerId === currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.name = profileName;
    currentUser.phone = profilePhone;
    currentUser.sector = profileSector;
    currentUser.municipality = profileMuni;
    showToast('Perfil actualizado correctamente');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner with User Greeting */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {currentUser.role === 'admin' ? 'Administrador' : 'Vendedor Verificado'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                {formatPhoneNumber(currentUser.phone)}
              </span>
              <span>•</span>
              <span>{currentUser.sector}, {currentUser.municipality}</span>
            </p>
          </div>
        </div>

        {/* Quick Action */}
        <button
          onClick={openPublishModal}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar Nuevo Artículo</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6 overflow-x-auto pb-1 text-sm font-bold">
        <button
          onClick={() => setActiveTab('my-listings')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'my-listings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Publicaciones ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'favorites'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Mis Favoritos ({favoriteListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contactos / Consultas ({myInquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Administrar Mi Perfil</span>
        </button>
      </div>

      {/* Tab 1: Mis Publicaciones with Status Controls */}
      {activeTab === 'my-listings' && (
        <div className="space-y-6">
          {/* Sub-filter: all, available, sold */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'available', 'sold'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setListingFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    listingFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'all' && `Todas (${myListings.length})`}
                  {filter === 'available' &&
                    `Disponibles (${myListings.filter((l) => l.status !== 'Vendido').length})`}
                  {filter === 'sold' &&
                    `Vendidas (${myListings.filter((l) => l.status === 'Vendido').length})`}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500">
              Marca un artículo como <strong>"Vendido"</strong> cuando cierres el trato con el comprador.
            </span>
          </div>

          {displayedListings.length > 0 ? (
            <div className="space-y-3">
              {displayedListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  {/* Thumbnail & Info */}
                  <div
                    onClick={() => openListingDetail(item.id)}
                    className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.status === 'Vendido' && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <span className="text-[9px] font-black uppercase text-red-400 bg-red-950/80 px-1 py-0.5 rounded">
                            Vendido
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                          {item.categoryId}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{item.condition}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {item.views} vistas
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm truncate mt-0.5">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-black text-slate-900">
                          {formatRDPrice(item.price)}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Changer */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Status dropdown */}
                    <select
                      aria-label="Cambiar estado del artículo"
                      value={item.status}
                      onChange={(e) => changeListingStatus(item.id, e.target.value as ItemStatus)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border outline-none cursor-pointer ${
                        item.status === 'Vendido'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.status === 'Reservado'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Reservado">Reservado</option>
                      <option value="Vendido">Marcar Vendido ✓</option>
                    </select>

                    {/* Edit button */}
                    <button
                      onClick={() => openEditListing(item)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1"
                      title="Editar publicación"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar permanentemente "${item.title}"?`)) {
                          deleteListing(item.id);
                        }
                      }}
                      className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No tienes publicaciones en esta sección
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Publica lo que ya no uses y véndelo hoy mismo en Hato Mayor.
              </p>
              <button
                onClick={openPublishModal}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Publicar artículo ahora
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favoriteListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No tienes publicaciones guardadas
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Guarda los artículos que te interesen haciendo clic en el corazón para consultarlos después.
              </p>
              <button
                onClick={() => setActiveView('search')}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Explorar artículos en Hato Mayor
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Contacts / Consultas */}
      {activeTab === 'contacts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Registro de Compradores Interesados
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Personas que han presionado los botones de WhatsApp o Llamada en tus publicaciones.
          </p>

          {myInquiries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {myInquiries.map((inq) => (
                <div key={inq.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{inq.buyerName}</h4>
                    <p className="text-xs text-slate-500">
                      Interesado en: <strong>{inq.listingTitle}</strong>
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Canal: {inq.channel.toUpperCase()} • {formatRelativeTime(inq.createdAt)}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {inq.buyerPhone}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aún no tienes registros de consultas directas. ¡Tus contactos se reflejarán aquí en tiempo real!
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Administrar Mi Perfil de Vendedor</h2>
          <p className="text-xs text-slate-500 mb-6">
            Mantén tus datos de contacto actualizados para que los compradores puedan comunicarse contigo.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo o Nombre del Negocio
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono y WhatsApp principal
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                required
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Municipio</label>
                <select
                  aria-label="Seleccionar municipio para el perfil"
                  value={profileMuni}
                  onChange={(e) => setProfileMuni(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {MUNICIPALITIES.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sector o Comunidad</label>
                <input
                  type="text"
                  value={profileSector}
                  onChange={(e) => setProfileSector(e.target.value)}
                  required
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Guardar Cambios en Perfil
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
