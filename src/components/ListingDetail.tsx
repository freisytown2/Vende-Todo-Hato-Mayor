import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatRDPrice,
  formatPhoneNumber,
  getWhatsAppUrl,
  formatRelativeTime,
} from '../utils/imageCompressor';
import {
  ArrowLeft,
  Share2,
  Heart,
  Flag,
  Phone,
  MessageCircle,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Store,
  Home,
  CheckCircle,
  Eye,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCheck,
  Loader2,
} from 'lucide-react';

export const ListingDetail: React.FC = () => {
  const {
    listings,
    selectedListingId,
    setActiveView,
    openSellerProfile,
    openShareModal,
    openReportModal,
    toggleFavorite,
    isFavorite,
    currentUser,
    openEditListing,
    deleteListing,
    changeListingStatus,
    logContact,
    isMyListing,
    fetchListingById,
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(selectedListingId && !listings.some((l) => l.id === selectedListingId));
  });

  const listing = listings.find((l) => l.id === selectedListingId);

  useEffect(() => {
    if (selectedListingId && !listing) {
      setIsLoading(true);
      fetchListingById(selectedListingId).finally(() => {
        setIsLoading(false);
      });
    } else if (listing) {
      setIsLoading(false);
      document.title = `${listing.title} - RD$ ${listing.price.toLocaleString()} | Vende Todo en Hato Mayor`;
    }
  }, [selectedListingId, listing, fetchListingById]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
          <Loader2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Cargando publicación...</h2>
        <p className="text-sm text-slate-500 mt-2">
          Buscando detalles de este artículo en Hato Mayor...
        </p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Publicación no encontrada</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Este artículo no está disponible o pudo haber sido eliminado por su vendedor.
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="mt-6 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all cursor-pointer shadow-sm"
        >
          Volver al inicio de Vende Todo
        </button>
      </div>
    );
  }

  const isOwner = isMyListing(listing);
  const isAdmin = currentUser?.role === 'admin';
  const favorite = isFavorite(listing.id);

  // Seller's other listings count
  const sellerListingsCount = listings.filter((l) => l.sellerId === listing.sellerId).length;

  const handleWhatsApp = () => {
    logContact(listing.id, 'whatsapp');
    const url = getWhatsAppUrl(listing.whatsapp || listing.phone, listing.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    logContact(listing.id, 'call');
    window.location.href = `tel:${listing.phone}`;
  };

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setActiveView('home')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a publicaciones</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={() => openShareModal(listing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Compartir</span>
          </button>

          {/* Favorite */}
          <button
            onClick={() => toggleFavorite(listing.id)}
            className={`p-2 rounded-xl border shadow-xs transition-colors ${
              favorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600'
            }`}
            title={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Report */}
          <button
            onClick={() => openReportModal(listing)}
            className="p-2 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 bg-white text-slate-400 shadow-xs transition-colors"
            title="Reportar publicación"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Owner / Admin Management Bar */}
      {(isOwner || isAdmin) && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900">
              {isOwner ? '⚡ Eres el propietario de este artículo' : '👑 Modo Administrador'}
            </span>
            <span className="text-amber-700 hidden sm:inline">• Administra el estado en vivo:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status switcher */}
            <div className="flex items-center rounded-xl bg-white border border-amber-200 p-0.5">
              {(['Disponible', 'Reservado', 'Vendido'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => changeListingStatus(listing.id, st)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    listing.status === st
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Edit */}
            <button
              onClick={() => openEditListing(listing)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas eliminar esta publicación permanentemente?')) {
                  deleteListing(listing.id);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Photo Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main big image view */}
          <div className="relative aspect-4/3 w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={listing.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-slate-950/80 backdrop-blur-xs text-white shadow-md">
                {listing.condition}
              </span>
              {listing.isFeatured && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                  ★ Destacado
                </span>
              )}
            </div>

            {listing.status === 'Vendido' && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20">
                <span className="text-2xl font-black uppercase tracking-wider bg-red-600 px-6 py-2 rounded-2xl shadow-xl">
                  Artículo Vendido
                </span>
                <p className="text-xs text-slate-300 mt-2">
                  Esta publicación ya no está disponible para compra activa.
                </p>
              </div>
            )}
          </div>

          {/* Thumbnails row (if multiple photos) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Descripción detallada</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Publicado {formatRelativeTime(listing.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{listing.views} visualizaciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Price, Location, Meeting Safety, and Seller Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {listing.categoryId.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Condición: <strong className="text-slate-800">{listing.condition}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {listing.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatRDPrice(listing.price)}
                </span>
                <span className="text-xs font-semibold text-slate-500">Pesos Dominicanos</span>
              </div>
            </div>

            {/* General Location Bar (Strictly private residential safety guarantee) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ubicación aproximada:</span>
              </div>
              <p className="text-xs font-medium text-slate-700 pl-6">
                {listing.municipality}, sector <strong>{listing.sector}</strong>, República Dominicana
              </p>
              <p className="text-[11px] text-slate-500 pl-6 italic">
                ℹ️ Por privacidad y seguridad ciudadana, la dirección exacta no se publica abiertamente y solo se coordina de mutuo acuerdo con el comprador.
              </p>
            </div>

            {/* Where meeting takes place & Explicit Safety Warning */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Lugar de Entrega o Encuentro
              </h4>

              {listing.meetingPlaceType === 'public' && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lugar público seguro:</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium pl-6">
                    {listing.meetingPlaceDetails || 'Parque Central o plaza pública de Hato Mayor'}
                  </p>
                </div>
              )}

              {listing.meetingPlaceType === 'business' && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <Store className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>En un negocio o comercio local:</span>
                  </div>
                  <p className="text-xs text-blue-950 font-medium pl-6">
                    {listing.meetingPlaceDetails || 'Local comercial indicado por el vendedor'}
                  </p>
                </div>
              )}

              {listing.meetingPlaceType === 'home' && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Home className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Entrega en casa del vendedor</span>
                  </div>
                  <p className="text-xs text-amber-900 font-medium pl-6">
                    {listing.meetingPlaceDetails || 'Coordinación previa por teléfono o WhatsApp'}
                  </p>
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-[11px] text-amber-950 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong>Advertencia de Seguridad:</strong> Recomendamos máxima precaución. No vayas solo/a y verifica los datos antes de dirigirte a una vivienda.
                    </div>
                  </div>
                </div>
              )}

              {listing.meetingPlaceType === 'other' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                    <span>Otro lugar acordado:</span>
                  </div>
                  <p className="text-xs text-slate-700 pl-6">
                    {listing.meetingPlaceDetails || 'A coordinar entre ambas partes'}
                  </p>
                </div>
              )}

              {/* General safety recommendation requirement */}
              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Recomendación para compras en Hato Mayor:</strong> Para mayor seguridad, recomendamos realizar los encuentros en lugares públicos y concurridos (como parques o bancos) y no transferir dinero antes de revisar el artículo.
                </span>
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="pt-2 space-y-3">
              {/* WhatsApp Button with direct pre-filled message */}
              <button
                onClick={handleWhatsApp}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Contactar por WhatsApp</span>
              </button>

              {/* Direct Call Button */}
              <button
                onClick={handleCall}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar: {formatPhoneNumber(listing.phone)}</span>
              </button>
            </div>
          </div>

          {/* Seller Profile Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Información del Vendedor
            </h4>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {listing.sellerName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{listing.sellerName}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{listing.sector}, {listing.municipality}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-base font-black text-slate-900">{sellerListingsCount}</span>
                <span className="text-[11px] text-slate-500">Artículos publicados</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-base font-black text-emerald-600">Verificado</span>
                <span className="text-[11px] text-slate-500">Vendedor local</span>
              </div>
            </div>

            <button
              onClick={() => openSellerProfile(listing.sellerId)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span>Ver perfil y más artículos de {listing.sellerName.split(' ')[0]}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
